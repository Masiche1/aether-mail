import os
import sys

from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView

from .models import EmailCampaign, EmailTemplate
from .serializers import EmailCampaignSerializer, EmailTemplateSerializer
from email_delivery.models import EmailAttachment

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if PROJECT_ROOT not in sys.path:
	sys.path.insert(0, PROJECT_ROOT)
from workers.scheduler.task import dispatch_campaign


class OrganizationScopedMixin:
	permission_classes = [permissions.IsAuthenticated]

	def initial(self, request, *args, **kwargs):
		super().initial(request, *args, **kwargs)
		membership = request.user.memberships.select_related('organization').first()
		if not membership:
			self.permission_denied(request, message='An organization membership is required.')
		request.organization = membership.organization
		self.organization = membership.organization


class CampaignListCreateView(OrganizationScopedMixin, generics.ListCreateAPIView):
	serializer_class = EmailCampaignSerializer

	def get_queryset(self):
		return EmailCampaign.objects.filter(organization=self.organization).prefetch_related('recipients')


class CampaignDetailView(OrganizationScopedMixin, generics.RetrieveUpdateAPIView):
	serializer_class = EmailCampaignSerializer

	def get_queryset(self):
		return EmailCampaign.objects.filter(organization=self.organization)


class CampaignDispatchView(OrganizationScopedMixin, APIView):
	def post(self, request, pk):
		campaign = EmailCampaign.objects.get(pk=pk, organization=self.organization)
		if campaign.status not in {'draft', 'scheduled', 'paused'}:
			return Response({'detail': 'Campaign cannot be dispatched in its current state.'}, status=400)
		if campaign.scheduled_at and campaign.scheduled_at > timezone.now():
			dispatch_campaign.apply_async((campaign.pk,), eta=campaign.scheduled_at)
		else:
			dispatch_campaign.delay(campaign.pk)
		campaign.status = 'queued'
		campaign.save(update_fields=['status', 'updated_at'])
		return Response({'status': campaign.status, 'campaign_id': campaign.pk})


class CampaignAttachmentView(OrganizationScopedMixin, APIView):
	parser_classes = [MultiPartParser, FormParser]

	def get(self, request, pk):
		campaign = EmailCampaign.objects.get(pk=pk, organization=self.organization)
		return Response([{'id': item.id, 'name': item.name, 'file': item.file.url} for item in campaign.attachments.all()])

	def post(self, request, pk):
		campaign = EmailCampaign.objects.get(pk=pk, organization=self.organization)
		uploaded_file = request.FILES.get('file')
		if not uploaded_file:
			return Response({'detail': 'A file is required.'}, status=400)
		if uploaded_file.size > 25 * 1024 * 1024:
			return Response({'detail': 'Attachments must be 25 MB or smaller.'}, status=400)
		attachment = EmailAttachment.objects.create(
			campaign=campaign,
			name=request.data.get('name') or uploaded_file.name,
			file=uploaded_file,
		)
		return Response({'id': attachment.id, 'name': attachment.name, 'file': attachment.file.url}, status=201)


class TemplateListCreateView(OrganizationScopedMixin, generics.ListCreateAPIView):
	serializer_class = EmailTemplateSerializer

	def get_queryset(self):
		return EmailTemplate.objects.filter(organization=self.organization)

	def perform_create(self, serializer):
		serializer.save(organization=self.organization, created_by=self.request.user)

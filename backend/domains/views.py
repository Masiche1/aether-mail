from django.utils import timezone
import dns.resolver
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DomainHealth, SendingDomain


class SendingDomainSerializer(serializers.ModelSerializer):
	class Meta:
		model = SendingDomain
		fields = ['id', 'domain', 'status', 'verification_token', 'created_at', 'verified_at']
		read_only_fields = ['id', 'status', 'verification_token', 'created_at', 'verified_at']


class SendingDomainListCreateView(generics.ListCreateAPIView):
	serializer_class = SendingDomainSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return SendingDomain.objects.filter(organization__memberships__user=self.request.user)

	def perform_create(self, serializer):
		membership = self.request.user.memberships.select_related('organization').first()
		if not membership:
			self.permission_denied(self.request, message='An organization membership is required.')
		serializer.save(organization=membership.organization)


class SendingDomainVerifyView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, pk):
		domain = SendingDomain.objects.get(pk=pk, organization__memberships__user=request.user)
		try:
			txt_records = dns.resolver.resolve(domain.domain, 'TXT')
			records = {value.decode() if isinstance(value, bytes) else value for record in txt_records for value in record.strings}
		except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.Timeout, dns.resolver.NoNameservers):
			return Response({'detail': 'Domain DNS records could not be resolved.'}, status=400)
		if request.data.get('token') != domain.verification_token or domain.verification_token not in records:
			return Response({'detail': 'Verification token does not match.'}, status=400)
		domain.status = 'verified'
		domain.verified_at = timezone.now()
		domain.save(update_fields=['status', 'verified_at'])
		return Response(SendingDomainSerializer(domain).data)


class SendingDomainHealthView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, pk):
		domain = SendingDomain.objects.get(pk=pk, organization__memberships__user=request.user)
		health, _ = DomainHealth.objects.get_or_create(domain=domain)
		return Response({
			'spf': health.spf_status, 'dkim': health.dkim_status, 'dmarc': health.dmarc_status,
			'mx': health.mx_status, 'ptr': health.ptr_status,
			'reputation_score': domain.reputation_score, 'last_checked_at': health.last_checked_at,
		})

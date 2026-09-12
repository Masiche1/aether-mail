# Mailbox endpoints
from django.contrib.auth.hashers import make_password
from rest_framework import generics, permissions, serializers

from .models import Mailbox, MailboxAlias


class MailboxSerializer(serializers.ModelSerializer):
	email = serializers.ReadOnlyField()
	password = serializers.CharField(write_only=True, min_length=8, required=False)

	class Meta:
		model = Mailbox
		fields = ['id', 'domain', 'local_part', 'email', 'password', 'quota_bytes', 'status', 'created_at']
		read_only_fields = ['id', 'email', 'created_at']

	def validate_domain(self, domain):
		if domain.organization_id != self.context['request'].organization.id or domain.status != 'verified':
			raise serializers.ValidationError('Mailbox creation requires a verified organization domain.')
		return domain

	def create(self, validated_data):
		password = validated_data.pop('password')
		return Mailbox.objects.create(
			organization=self.context['request'].organization,
			password_hash=make_password(password),
			**validated_data,
		)

	def update(self, instance, validated_data):
		password = validated_data.pop('password', None)
		if password:
			instance.password_hash = make_password(password)
		return super().update(instance, validated_data)


class MailboxAliasSerializer(serializers.ModelSerializer):
	class Meta:
		model = MailboxAlias
		fields = ['id', 'address', 'created_at']
		read_only_fields = ['id', 'created_at']


class MailboxListCreateView(generics.ListCreateAPIView):
	serializer_class = MailboxSerializer
	permission_classes = [permissions.IsAuthenticated]

	def initial(self, request, *args, **kwargs):
		super().initial(request, *args, **kwargs)
		membership = request.user.memberships.select_related('organization').first()
		if not membership:
			self.permission_denied(request, message='An organization membership is required.')
		request.organization = membership.organization

	def get_queryset(self):
		return Mailbox.objects.filter(organization=self.request.organization).select_related('domain')


class MailboxDetailView(generics.RetrieveUpdateDestroyAPIView):
	serializer_class = MailboxSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Mailbox.objects.filter(organization__memberships__user=self.request.user).select_related('domain')


class MailboxAliasListCreateView(generics.ListCreateAPIView):
	serializer_class = MailboxAliasSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return MailboxAlias.objects.filter(mailbox__organization__memberships__user=self.request.user)

	def list(self, request, *args, **kwargs):
		aliases = self.get_queryset().filter(mailbox_id=kwargs['mailbox_id'])
		return Response([{'id': alias.id, 'address': alias.address} for alias in aliases])

	def create(self, request, *args, **kwargs):
		mailbox = Mailbox.objects.get(pk=kwargs['mailbox_id'], organization__memberships__user=request.user)
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		alias = MailboxAlias.objects.create(mailbox=mailbox, address=serializer.validated_data['address'].lower())
		return Response({'id': alias.id, 'address': alias.address}, status=201)
# GET /mailboxes, POST /mailboxes

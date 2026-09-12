from rest_framework import generics, permissions, serializers

from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
	class Meta:
		model = Contact
		fields = ['id', 'email', 'phone', 'first_name', 'last_name', 'company', 'status', 'email_subscribed', 'sms_subscribed', 'created_at', 'updated_at']
		read_only_fields = ['id', 'created_at', 'updated_at']


class ContactListCreateView(generics.ListCreateAPIView):
	serializer_class = ContactSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Contact.objects.filter(organization__memberships__user=self.request.user)

	def perform_create(self, serializer):
		membership = self.request.user.memberships.select_related('organization').first()
		if not membership:
			self.permission_denied(self.request, message='An organization membership is required.')
		serializer.save(organization=membership.organization)
# GET /contacts, POST /contacts, POST /contacts/import

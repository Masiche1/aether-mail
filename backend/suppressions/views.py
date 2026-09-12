from rest_framework import generics, permissions, serializers

from .models import Suppression


class SuppressionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Suppression
		fields = ['id', 'email', 'reason', 'created_at']
		read_only_fields = ['id', 'created_at']


class SuppressionListCreateView(generics.ListCreateAPIView):
	serializer_class = SuppressionSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Suppression.objects.filter(organization__memberships__user=self.request.user)

	def perform_create(self, serializer):
		membership = self.request.user.memberships.select_related('organization').first()
		if not membership:
			self.permission_denied(self.request, message='An organization membership is required.')
		serializer.save(organization=membership.organization, email=serializer.validated_data['email'].lower())

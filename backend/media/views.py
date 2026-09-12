from rest_framework import generics, permissions, serializers

from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
	class Meta:
		model = MediaAsset
		fields = ['id', 'name', 'file', 'created_at']
		read_only_fields = ['id', 'created_at']


class MediaAssetListCreateView(generics.ListCreateAPIView):
	serializer_class = MediaAssetSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return MediaAsset.objects.filter(organization__memberships__user=self.request.user)

	def perform_create(self, serializer):
		membership = self.request.user.memberships.select_related('organization').first()
		if not membership:
			self.permission_denied(self.request, message='An organization membership is required.')
		serializer.save(organization=membership.organization, uploaded_by=self.request.user)

from rest_framework import generics, permissions

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AuditLog.objects.filter(organization__memberships__user=self.request.user).select_related('actor', 'organization')# Audit endpoints

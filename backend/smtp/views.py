from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .models import SmtpProvider


class SmtpProviderViewSet(viewsets.ModelViewSet):
    queryset = SmtpProvider.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = None

    def list(self, request, *args, **kwargs):
        providers = SmtpProvider.objects.filter(
            organization__memberships__user=request.user,
        ).distinct()
        data = [{
            'id': provider.id,
            'name': provider.name,
            'provider_type': provider.provider_type,
            'host': provider.host,
            'port': provider.port,
            'username': provider.username,
            'use_tls': provider.use_tls,
            'use_ssl': provider.use_ssl,
            'allowed_domains': provider.allowed_domains,
            'priority': provider.priority,
            'is_active': provider.is_active,
            'is_default': provider.is_default,
            'status': provider.status,
        } for provider in providers]
        return Response(data)

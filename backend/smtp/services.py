from __future__ import annotations

from typing import Optional

from django.db.models import Q

from .models import SmtpProvider


def normalize_domain(value: str) -> str:
    return (value or '').strip().lower().lstrip('.').rstrip('.')


def route_smtp_provider_for_sender(sender_email: str, organization=None) -> Optional[SmtpProvider]:
    """Pick the best SMTP provider for a sender address.

    Selection order:
    1. Active providers whose allowed_domains contains the sender domain.
    2. Otherwise the default active provider for the organization.
    3. Otherwise the highest-priority active provider.
    4. Otherwise None.
    """
    domain = normalize_domain(sender_email.split('@', 1)[-1]) if '@' in sender_email else ''
    queryset = SmtpProvider.objects.filter(is_active=True)
    if organization is not None:
        queryset = queryset.filter(Q(organization=organization) | Q(is_global=True))

    candidates = []
    for provider in queryset.order_by('-priority', '-is_default', 'name'):
        allowed = provider.allowed_domains or []
        if domain and any(normalize_domain(item) == domain for item in allowed):
            candidates.append(provider)
        elif provider.is_default and organization is not None and provider.organization_id == organization.pk:
            candidates.append(provider)

    if candidates:
        return sorted(candidates, key=lambda p: (p.priority, p.is_default), reverse=True)[0]

    if organization is not None:
        default_provider = queryset.filter(organization=organization, is_default=True, is_active=True).first()
        if default_provider:
            return default_provider

    return queryset.order_by('-priority', '-is_default', 'name').first()

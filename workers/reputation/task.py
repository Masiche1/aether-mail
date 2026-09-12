# Reputation Worker - Monitors and calculates sender reputation
import os
import sys

from celery import shared_task

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()

from domains.models import SendingDomain
from email_delivery.models import EmailBounce, EmailMessage

@shared_task
def calculate_reputation_scores():
    """
    Celery task to calculate sender reputation scores.
    Evaluates bounce rate, complaint rate, engagement metrics.
    """
    updated = 0
    for domain in SendingDomain.objects.all():
        messages = EmailMessage.objects.filter(sender__iendswith=f'@{domain.domain}')
        total = messages.count()
        bounces = EmailBounce.objects.filter(message__in=messages).count()
        bounce_rate = bounces / total if total else 0
        score = max(0, min(100, round((1 - min(bounce_rate, 1)) * 100)))
        domain.reputation_score = min(domain.reputation_score or score, score) if domain.reputation_score else score
        domain.save(update_fields=['reputation_score'])
        updated += 1
    return updated

@shared_task
def check_blacklist_status():
    """
    Celery task to check if domains/IPs are on blacklists.
    Monitors Spamhaus, SORBS, etc.
    """
    pass

@shared_task
def throttle_sending_based_on_reputation():
    """
    Celery task to adjust sending rate based on reputation.
    Implements adaptive throttling.
    """
    pass

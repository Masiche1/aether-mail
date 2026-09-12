# Email Retry Worker - Handles retry logic for failed emails
import os
import sys

from celery import shared_task

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()

from email_delivery.models import EmailDelivery
from workers.email_sender.task import send_email_task

@shared_task
def retry_failed_emails():
    """
    Celery task to retry failed email deliveries.
    Uses exponential backoff strategy.
    """
    queued = 0
    for delivery in EmailDelivery.objects.filter(status='failed', attempts__lt=5).select_related('message'):
        delivery.message.status = 'queued'
        delivery.message.save(update_fields=['status'])
        send_email_task.apply_async((delivery.message_id,), countdown=min(3600, 60 * (2 ** delivery.attempts)))
        queued += 1
    return queued

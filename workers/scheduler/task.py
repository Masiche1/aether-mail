# Scheduler Worker - Handles campaign scheduling and triggering
import os
import sys

from celery import shared_task

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from django.db import transaction
from django.utils import timezone

from campaigns.models import EmailCampaign
from email_delivery.models import EmailMessage
from suppressions.models import Suppression
from workers.email_sender.task import send_email_task

@shared_task
def check_scheduled_campaigns():
    """
    Celery task to check for campaigns that should be sent.
    Runs periodically to trigger ready campaigns.
    """
    campaign_ids = list(EmailCampaign.objects.filter(status='scheduled', scheduled_at__lte=timezone.now()).values_list('id', flat=True))
    EmailCampaign.objects.filter(id__in=campaign_ids).update(status='queued')
    for campaign_id in campaign_ids:
        dispatch_campaign.delay(campaign_id)
    return len(campaign_ids)

@shared_task
def process_automation_triggers():
    """
    Celery task to process automation workflow triggers.
    """
    pass

@shared_task
def send_scheduled_email_campaign(campaign_id):
    """
    Celery task to send a specific scheduled campaign.
    
    Args:
        campaign_id: ID of the campaign to send
    """
    return dispatch_campaign(campaign_id)


@shared_task
def dispatch_campaign(campaign_id):
    with transaction.atomic():
        campaign = EmailCampaign.objects.select_for_update().get(pk=campaign_id)
        if campaign.status == 'sending':
            return 0
        campaign.status = 'sending'
        campaign.save(update_fields=['status', 'updated_at'])
        messages = []
        suppressed = {email.lower() for email in Suppression.objects.filter(organization=campaign.organization).values_list('email', flat=True)}
        for recipient in campaign.recipients.filter(status='queued'):
            if recipient.email.lower() in suppressed:
                recipient.status = 'failed'
                recipient.save(update_fields=['status'])
                continue
            values = {'first_name': recipient.first_name, 'last_name': recipient.last_name, 'email': recipient.email}
            values.update(recipient.variables or {})
            render = lambda value: value.format(**values)
            messages.append(EmailMessage(
                organization=campaign.organization,
                campaign=campaign,
                campaign_recipient=recipient,
                sender=render(campaign.sender),
                recipient=recipient.email,
                subject=render(campaign.subject),
                body_text=render(campaign.body_text),
                body_html=render(campaign.body_html),
            ))
        EmailMessage.objects.bulk_create(messages)
        if not messages:
            campaign.status = 'completed'
            campaign.save(update_fields=['status', 'updated_at'])
    for message in EmailMessage.objects.filter(campaign_id=campaign_id, status='queued'):
        send_email_task.delay(message.pk)
    return len(messages)

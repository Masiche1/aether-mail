from django.conf import settings
from django.db import models

from organizations.models import Organization
from campaigns.models import CampaignRecipient, EmailCampaign
from mailboxes.models import Mailbox


class EmailMessage(models.Model):
    FOLDER_CHOICES = [('inbox', 'Inbox'), ('sent', 'Sent'), ('replies', 'Replies'), ('trash', 'Trash')]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='email_messages')
    campaign = models.ForeignKey(EmailCampaign, null=True, blank=True, on_delete=models.SET_NULL, related_name='messages')
    campaign_recipient = models.OneToOneField(CampaignRecipient, null=True, blank=True, on_delete=models.SET_NULL, related_name='message')
    mailbox = models.ForeignKey(Mailbox, null=True, blank=True, on_delete=models.SET_NULL, related_name='messages')
    sender = models.EmailField()
    recipient = models.EmailField()
    subject = models.CharField(max_length=998)
    body_text = models.TextField(blank=True)
    body_html = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='queued')
    folder = models.CharField(max_length=20, choices=FOLDER_CHOICES, default='sent')
    headers = models.JSONField(default=dict, blank=True)
    in_reply_to = models.CharField(max_length=998, blank=True)
    message_id = models.CharField(max_length=255, blank=True, unique=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)


class EmailAttachment(models.Model):
    campaign = models.ForeignKey(EmailCampaign, on_delete=models.CASCADE, related_name='attachments')
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='attachments/%Y/%m/')
    created_at = models.DateTimeField(auto_now_add=True)


class EmailDelivery(models.Model):
    message = models.OneToOneField(EmailMessage, on_delete=models.CASCADE, related_name='delivery')
    status = models.CharField(max_length=20, default='pending')
    attempts = models.PositiveIntegerField(default=0)
    response = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class EmailBounce(models.Model):
    message = models.ForeignKey(EmailMessage, null=True, blank=True, on_delete=models.SET_NULL, related_name='bounces')
    recipient = models.EmailField()
    bounce_type = models.CharField(max_length=20, choices=[('hard', 'Hard'), ('soft', 'Soft')])
    reason = models.TextField(blank=True)
    raw_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

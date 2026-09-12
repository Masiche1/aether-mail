from django.conf import settings
from django.db import models

from organizations.models import Organization


class EmailTemplate(models.Model):
	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='email_templates')
	name = models.CharField(max_length=200)
	subject = models.CharField(max_length=998)
	body_text = models.TextField(blank=True)
	body_html = models.TextField(blank=True)
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)


class EmailCampaign(models.Model):
	STATUS_CHOICES = [
		('draft', 'Draft'),
		('scheduled', 'Scheduled'),
		('queued', 'Queued'),
		('sending', 'Sending'),
		('completed', 'Completed'),
		('paused', 'Paused'),
	]

	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='email_campaigns')
	name = models.CharField(max_length=200)
	sender = models.EmailField()
	subject = models.CharField(max_length=998)
	body_text = models.TextField(blank=True)
	body_html = models.TextField(blank=True)
	template = models.ForeignKey(EmailTemplate, null=True, blank=True, on_delete=models.SET_NULL, related_name='campaigns')
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
	scheduled_at = models.DateTimeField(null=True, blank=True)
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)


class CampaignRecipient(models.Model):
	STATUS_CHOICES = [
		('queued', 'Queued'),
		('sent', 'Sent'),
		('failed', 'Failed'),
	]

	campaign = models.ForeignKey(EmailCampaign, on_delete=models.CASCADE, related_name='recipients')
	email = models.EmailField()
	first_name = models.CharField(max_length=150, blank=True)
	last_name = models.CharField(max_length=150, blank=True)
	variables = models.JSONField(default=dict, blank=True)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['campaign', 'email'], name='unique_campaign_recipient')]

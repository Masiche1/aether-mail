import secrets

from django.db import models

from organizations.models import Organization


class SendingDomain(models.Model):
	STATUS_CHOICES = [('pending', 'Pending'), ('verified', 'Verified'), ('failed', 'Failed')]

	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='sending_domains')
	domain = models.CharField(max_length=253)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
	verification_token = models.CharField(max_length=64, unique=True, default=secrets.token_hex)
	created_at = models.DateTimeField(auto_now_add=True)
	verified_at = models.DateTimeField(null=True, blank=True)
	reputation_score = models.PositiveSmallIntegerField(default=0)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['organization', 'domain'], name='unique_domain_per_organization')]


class DomainHealth(models.Model):
	domain = models.OneToOneField(SendingDomain, on_delete=models.CASCADE, related_name='health')
	spf_status = models.CharField(max_length=10, default='unknown')
	dkim_status = models.CharField(max_length=10, default='unknown')
	dmarc_status = models.CharField(max_length=10, default='unknown')
	mx_status = models.CharField(max_length=10, default='unknown')
	ptr_status = models.CharField(max_length=10, default='unknown')
	last_checked_at = models.DateTimeField(auto_now=True)

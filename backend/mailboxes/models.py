# Mailbox models
# Models: Mailbox, MailboxAlias, MailboxCredential
from django.db import models

from domains.models import SendingDomain
from organizations.models import Organization


class Mailbox(models.Model):
	STATUS_CHOICES = [('active', 'Active'), ('suspended', 'Suspended')]

	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='mailboxes')
	domain = models.ForeignKey(SendingDomain, on_delete=models.CASCADE, related_name='mailboxes')
	local_part = models.CharField(max_length=64)
	password_hash = models.CharField(max_length=128)
	quota_bytes = models.PositiveBigIntegerField(default=10 * 1024 * 1024 * 1024)
	status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['domain', 'local_part'], name='unique_mailbox_per_domain')]

	@property
	def email(self):
		return f'{self.local_part}@{self.domain.domain}'


class MailboxAlias(models.Model):
	mailbox = models.ForeignKey(Mailbox, on_delete=models.CASCADE, related_name='aliases')
	address = models.EmailField(unique=True)
	created_at = models.DateTimeField(auto_now_add=True)

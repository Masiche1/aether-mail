from django.db import models

from organizations.models import Organization


class Contact(models.Model):
	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='contacts')
	email = models.EmailField()
	phone = models.CharField(max_length=40, blank=True)
	first_name = models.CharField(max_length=150, blank=True)
	last_name = models.CharField(max_length=150, blank=True)
	company = models.CharField(max_length=200, blank=True)
	status = models.CharField(max_length=20, default='active')
	email_subscribed = models.BooleanField(default=True)
	sms_subscribed = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['organization', 'email'], name='unique_contact_per_organization')]
		ordering = ['-created_at']

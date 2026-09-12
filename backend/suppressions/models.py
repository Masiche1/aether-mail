from django.db import models

from organizations.models import Organization


class Suppression(models.Model):
	REASONS = [('bounce', 'Bounce'), ('complaint', 'Complaint'), ('unsubscribe', 'Unsubscribe'), ('manual', 'Manual')]

	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='suppressions')
	email = models.EmailField()
	reason = models.CharField(max_length=20, choices=REASONS, default='manual')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['organization', 'email'], name='unique_suppression_per_organization')]

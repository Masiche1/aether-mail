from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.db import models

from organizations.models import Organization


class MediaAsset(models.Model):
	organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='media_assets')
	name = models.CharField(max_length=255)
	file = models.FileField(upload_to='media/%Y/%m/', validators=[FileExtensionValidator(
		allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'csv'],
	)])
	uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-created_at']

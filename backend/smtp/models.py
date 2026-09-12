from django.conf import settings
from django.db import models


class SmtpProvider(models.Model):
    PROVIDER_CHOICES = [
        ('namecheap', 'Namecheap Private Email'),
        ('self_hosted', 'Self Hosted MTA'),
        ('custom', 'Custom SMTP'),
    ]

    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='smtp_providers')
    name = models.CharField(max_length=200)
    provider_type = models.CharField(max_length=30, choices=PROVIDER_CHOICES, default='custom')
    host = models.CharField(max_length=255)
    port = models.PositiveIntegerField(default=587)
    username = models.CharField(max_length=255, blank=True)
    password = models.CharField(max_length=255, blank=True)
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    allowed_domains = models.JSONField(default=list, blank=True)
    priority = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    is_global = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='connected')
    last_tested_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-priority', '-is_default', 'name']


class SmtpCredential(models.Model):
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='smtp_credentials')
    provider = models.ForeignKey(SmtpProvider, on_delete=models.CASCADE, related_name='credentials')
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.provider.name} credential'

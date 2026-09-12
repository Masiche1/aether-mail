from django.test import TestCase

from organizations.models import Organization
from smtp.models import SmtpProvider
from smtp.services import route_smtp_provider_for_sender


class SmtpRoutingTests(TestCase):
    def setUp(self):
        self.organization = Organization.objects.create(name='Example Org', slug='example-org')

    def test_routes_to_default_namecheap_provider_for_private_email_domain(self):
        provider = SmtpProvider.objects.create(
            organization=self.organization,
            name='Namecheap SMTP',
            provider_type='namecheap',
            host='mail.privateemail.com',
            port=465,
            username='alerts@example.com',
            password='secret',
            is_active=True,
            is_default=True,
            allowed_domains=['example.com'],
        )

        result = route_smtp_provider_for_sender('alerts@example.com', self.organization)

        self.assertEqual(result.id, provider.id)

    def test_routes_to_highest_priority_active_provider_for_sender_domain(self):
        namecheap = SmtpProvider.objects.create(
            organization=self.organization,
            name='Namecheap SMTP',
            provider_type='namecheap',
            host='mail.privateemail.com',
            port=465,
            username='alerts@example.com',
            password='secret',
            is_active=True,
            is_default=True,
            allowed_domains=['example.com'],
        )
        self_hosted = SmtpProvider.objects.create(
            organization=self.organization,
            name='Self Hosted MTA',
            provider_type='self_hosted',
            host='smtp.internal.local',
            port=587,
            username='mailer',
            password='secret',
            is_active=True,
            is_default=False,
            allowed_domains=['internal.example.com'],
            priority=10,
        )

        result = route_smtp_provider_for_sender('campaign@internal.example.com', self.organization)

        self.assertEqual(result.id, self_hosted.id)
        self.assertNotEqual(result.id, namecheap.id)

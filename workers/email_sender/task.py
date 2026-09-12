import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
backend_key = os.path.normcase(backend_dir)
sys.path[:] = [entry for entry in sys.path if os.path.normcase(os.path.abspath(entry or os.getcwd())) != backend_key]
import email  # noqa: E402
sys.path.insert(0, backend_dir)

import django  # noqa: E402
from celery import shared_task
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from email_delivery.models import EmailDelivery, EmailMessage  # noqa: E402
from smtp.models import SmtpProvider
from smtp.services import route_smtp_provider_for_sender  # noqa: E402

@shared_task
def send_email_task(message_id):
    """
    Celery task to send an email message.
    
    Args:
        message_id: ID of the message to send
    """
    message = EmailMessage.objects.get(pk=message_id)
    delivery, _ = EmailDelivery.objects.get_or_create(message=message)
    domain = message.sender.rsplit('@', 1)[-1].lower()
    hour_key = f'aethermail:send-rate:{domain}:{timezone.now().strftime("%Y%m%d%H")}'
    limit = int(os.getenv('EMAIL_HOURLY_LIMIT', '1000'))
    cache.add(hour_key, 0, timeout=3700)
    if cache.incr(hour_key) > limit:
        cache.decr(hour_key)
        message.status = 'queued'
        message.save(update_fields=['status'])
        send_email_task.apply_async((message_id,), countdown=60)
        return 'throttled'
    delivery.attempts += 1
    provider = route_smtp_provider_for_sender(message.sender, message.organization)
    if provider is None:
        provider = SmtpProvider.objects.filter(is_active=True).order_by('-priority', '-is_default', 'name').first()
    try:
        email = EmailMultiAlternatives(
            message.subject,
            message.body_text,
            message.sender,
            [message.recipient],
            connection=None,
        )
        if provider:
            email.connection = None
            email.extra_headers['X-AetherMail-Provider'] = provider.name
            email.extra_headers['X-AetherMail-Provider-Type'] = provider.provider_type
        unsubscribe = f'mailto:{message.sender}?subject=unsubscribe'
        email.extra_headers['List-Unsubscribe'] = f'<{unsubscribe}>'
        email.extra_headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
        if message.in_reply_to:
            email.extra_headers['In-Reply-To'] = message.in_reply_to
            email.extra_headers['References'] = message.in_reply_to
        if message.body_html:
            email.attach_alternative(message.body_html, 'text/html')
        if message.campaign_id:
            for attachment in message.campaign.attachments.all():
                email.attach_file(attachment.file.path)
        if provider:
            smtp_backend = __import__('django.core.mail.backends.smtp', fromlist=['EmailBackend']).EmailBackend(
                host=provider.host,
                port=provider.port,
                username=provider.username,
                password=provider.password,
                use_tls=provider.use_tls,
                use_ssl=provider.use_ssl,
                timeout=30,
            )
            email.connection = smtp_backend
        email.send(fail_silently=False)
        message.status = 'sent'
        message.sent_at = timezone.now()
        if message.campaign_recipient_id:
            message.campaign_recipient.status = 'sent'
            message.campaign_recipient.save(update_fields=['status'])
        delivery.status = 'delivered'
        delivery.response = f'Accepted by {provider.name if provider else "default SMTP server"}'
        message.save(update_fields=['status', 'sent_at'])
    except Exception as exc:
        message.status = 'failed'
        if message.campaign_recipient_id:
            message.campaign_recipient.status = 'failed'
            message.campaign_recipient.save(update_fields=['status'])
        delivery.status = 'failed'
        delivery.response = str(exc)
        message.save(update_fields=['status'])
        delivery.save()
        raise
    delivery.save()
    return delivery.status

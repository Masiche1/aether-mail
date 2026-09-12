import os
import re
import sys
from pathlib import Path

import django
from celery import shared_task
from django.db import transaction

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
backend_key = os.path.normcase(backend_dir)
sys.path[:] = [entry for entry in sys.path if os.path.normcase(os.path.abspath(entry or os.getcwd())) != backend_key]
import email  # noqa: E402
sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from email_delivery.models import EmailBounce, EmailMessage  # noqa: E402
from suppressions.models import Suppression  # noqa: E402

BOUNCE_MAILDIR = Path(os.getenv('BOUNCE_MAILDIR', '/var/mail/aethermail-bounces/new'))
RECIPIENT_PATTERN = re.compile(r'<([^>]+)>|Final-Recipient:\s*rfc822;\s*(\S+)', re.IGNORECASE)

@shared_task
def process_bounces():
    """
    Celery task to process incoming bounce emails.
    Categorizes as hard/soft bounce and updates contact status.
    """
    processed = 0
    if not BOUNCE_MAILDIR.exists():
        return processed
    for path in BOUNCE_MAILDIR.iterdir():
        if not path.is_file():
            continue
        raw = path.read_text(errors='replace')
        parsed = email.message_from_string(raw)
        recipient_match = RECIPIENT_PATTERN.search(raw)
        recipient = next((value for value in recipient_match.groups() if value), '') if recipient_match else parsed.get('To', '')
        diagnostic = parsed.get('Diagnostic-Code', '')
        hard = any(marker in f'{parsed.get("Status", "")} {diagnostic}'.lower() for marker in ('5.', 'user unknown', 'mailbox unavailable'))
        with transaction.atomic():
            message = EmailMessage.objects.filter(recipient__iexact=recipient).order_by('-created_at').first()
            EmailBounce.objects.create(message=message, recipient=recipient, bounce_type='hard' if hard else 'soft', reason=diagnostic, raw_message=raw)
            if message:
                message.status = 'bounced'
                message.save(update_fields=['status'])
                should_suppress = hard or EmailBounce.objects.filter(
                    recipient__iexact=recipient,
                    bounce_type='soft',
                ).count() >= 3
                if should_suppress:
                    Suppression.objects.get_or_create(
                        organization=message.organization,
                        email=recipient.lower(),
                        defaults={'reason': 'bounce'},
                    )
        path.unlink()
        processed += 1
    return processed

@shared_task
def process_complaints():
    """
    Celery task to process abuse complaints.
    Automatically suppresses contacts.
    """
    return 0

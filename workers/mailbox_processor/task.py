# Mailbox Processor Worker - Processes incoming mail from Dovecot mailboxes
from celery import shared_task
# Mailbox Processor Worker - Handles incoming mail processing
import email
import hashlib
import imaplib
import os
import sys

from celery import shared_task

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django

django.setup()

from django.db import transaction

from email_delivery.models import EmailMessage as StoredEmailMessage
from mailboxes.models import Mailbox


@shared_task
def process_mailboxes():
    host = os.getenv('IMAP_HOST', 'dovecot')
    port = int(os.getenv('IMAP_PORT', '993'))
    password = os.getenv('IMAP_PASSWORD')
    if not password:
        return {'status': 'skipped', 'reason': 'IMAP_PASSWORD is not configured', 'processed': 0}

    processed = 0
    for mailbox in Mailbox.objects.filter(status='active').select_related('domain'):
        connection = imaplib.IMAP4_SSL(host, port)
        try:
            connection.login(mailbox.email, password)
            connection.select('INBOX')
            _, data = connection.search(None, 'UNSEEN')
            for message_number in data[0].split():
                _, raw_data = connection.fetch(message_number, '(RFC822)')
                raw_message = raw_data[0][1]
                parsed = email.message_from_bytes(raw_message)
                message_id = parsed.get('Message-ID') or f'<imap-{hashlib.sha256(raw_message).hexdigest()}@local>'
                body_text = ''
                if parsed.is_multipart():
                    for part in parsed.walk():
                        if part.get_content_type() == 'text/plain' and not part.get_filename():
                            payload = part.get_payload(decode=True)
                            body_text = payload.decode(errors='replace') if payload else ''
                            break
                else:
                    payload = parsed.get_payload(decode=True)
                    body_text = payload.decode(errors='replace') if payload else ''
                with transaction.atomic():
                    StoredEmailMessage.objects.get_or_create(
                        mailbox=mailbox,
                        message_id=message_id,
                        defaults={
                            'organization': mailbox.organization,
                            'sender': parsed.get('From', ''),
                            'recipient': mailbox.email,
                            'subject': parsed.get('Subject', '(no subject)'),
                            'body_text': body_text,
                            'folder': 'replies' if parsed.get('In-Reply-To') else 'inbox',
                            'headers': dict(parsed.items()),
                            'in_reply_to': parsed.get('In-Reply-To', ''),
                            'status': 'received',
                        },
                    )
                connection.store(message_number, '+FLAGS', '\\Seen')
                processed += 1
        finally:
            try:
                connection.logout()
            except imaplib.IMAP4.error:
                pass
    return {'status': 'ok', 'processed': processed}


@shared_task
def process_incoming_mail():
    return process_mailboxes()

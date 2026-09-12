# DNS Monitor Worker - Monitors domain DNS configuration and health
import os
import socket
import sys

import dns.resolver
from celery import shared_task
from django.utils import timezone

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django

django.setup()

from domains.models import DomainHealth, SendingDomain


def record_status(domain, record_type, name=None):
    try:
        records = dns.resolver.resolve(name or domain.domain, record_type)
        return 'pass' if records else 'fail'
    except dns.resolver.DNSException:
        return 'fail'


def txt_contains(domain, value, name=None):
    try:
        records = dns.resolver.resolve(name or domain.domain, 'TXT')
        return 'pass' if any(value in ''.join(item.decode() if isinstance(item, bytes) else item for item in record.strings) for record in records) else 'fail'
    except dns.resolver.DNSException:
        return 'fail'

@shared_task
def monitor_dns_records():
    """
    Celery task to monitor DNS record health.
    Checks SPF, DKIM, DMARC, MX records for all configured domains.
    """
    checked = 0
    for domain in SendingDomain.objects.all():
        health = DomainHealth.objects.update_or_create(
            domain=domain,
            defaults={
                'spf_status': txt_contains(domain, 'v=spf1'),
                'dkim_status': txt_contains(domain, 'v=DKIM1', f"{os.getenv('DKIM_SELECTOR', 'selector1')}._domainkey.{domain.domain}"),
                'dmarc_status': txt_contains(domain, 'v=DMARC1', f'_dmarc.{domain.domain}'),
                'mx_status': record_status(domain, 'MX'),
                'ptr_status': ptr_status(),
            },
        )[0]
        passed = sum(getattr(health, field) == 'pass' for field in ('spf_status', 'dkim_status', 'dmarc_status', 'mx_status', 'ptr_status'))
        domain.reputation_score = passed * 20
        domain.save(update_fields=['reputation_score'])
        checked += 1
    return checked


def ptr_status():
    sending_ip = os.getenv('SENDING_IP')
    if not sending_ip:
        return 'unknown'
    try:
        socket.gethostbyaddr(sending_ip)
        return 'pass'
    except (socket.herror, socket.gaierror):
        return 'fail'

@shared_task
def verify_domain_ownership():
    """
    Celery task to verify domain ownership.
    Checks for DNS TXT records.
    """
    verified = 0
    for domain in SendingDomain.objects.filter(status='pending'):
        try:
            records = {value.decode() if isinstance(value, bytes) else value for record in dns.resolver.resolve(domain.domain, 'TXT') for value in record.strings}
        except dns.resolver.DNSException:
            continue
        if domain.verification_token in records:
            domain.status = 'verified'
            domain.verified_at = timezone.now()
            domain.save(update_fields=['status', 'verified_at'])
            verified += 1
    return verified

@shared_task
def check_dkim_propagation():
    """
    Celery task to check DKIM key propagation.
    """
    return 0

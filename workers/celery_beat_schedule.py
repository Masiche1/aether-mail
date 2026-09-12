# Celery Beat schedule configuration
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'retry-failed-emails': {
        'task': 'workers.email_retry.task.retry_failed_emails',
        'schedule': crontab(minute='*/5'),
    },
    'process-mailboxes': {
        'task': 'workers.mailbox_processor.task.process_mailboxes',
        'schedule': crontab(minute='*/2'),
    },
    'check-scheduled-campaigns': {
        'task': 'workers.scheduler.task.check_scheduled_campaigns',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'process-automation-triggers': {
        'task': 'workers.scheduler.task.process_automation_triggers',
        'schedule': crontab(minute='*/5'),
    },
    'process-bounces': {
        'task': 'workers.bounce_processor.task.process_bounces',
        'schedule': crontab(minute='*/10'),
    },
    'calculate-reputation-scores': {
        'task': 'workers.reputation.task.calculate_reputation_scores',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
    },
    'check-blacklist-status': {
        'task': 'workers.reputation.task.check_blacklist_status',
        'schedule': crontab(minute=0, hour='*/12'),  # Every 12 hours
    },
    'monitor-dns-records': {
        'task': 'workers.dns_monitor.task.monitor_dns_records',
        'schedule': crontab(minute=0, hour='*/3'),  # Every 3 hours
    },
    'aggregate-tracking-events': {
        'task': 'workers.tracking_processor.task.aggregate_tracking_events',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
    },
}

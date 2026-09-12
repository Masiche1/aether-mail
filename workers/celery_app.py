# Celery configuration for workers
import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
backend_key = os.path.normcase(backend_dir)
sys.path[:] = [entry for entry in sys.path if os.path.normcase(os.path.abspath(entry or os.getcwd())) != backend_key]
import email  # noqa: E402,F401
sys.path.insert(0, backend_dir)

from celery import Celery

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('aethermail', include=[
    'workers.email_sender.task',
    'workers.bounce_processor.task',
    'workers.scheduler.task',
    'workers.email_retry.task',
    'workers.mailbox_processor.task',
    'workers.dns_monitor.task',
    'workers.reputation.task',
])

# Load configuration from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')
from workers.celery_beat_schedule import CELERY_BEAT_SCHEDULE

app.conf.beat_schedule = CELERY_BEAT_SCHEDULE

# Auto-discover tasks from all registered Django apps
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

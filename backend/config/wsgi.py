import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_key = os.path.normcase(backend_dir)
sys.path[:] = [entry for entry in sys.path if os.path.normcase(os.path.abspath(entry or os.getcwd())) != backend_key]
import email  # noqa: E402,F401
sys.path.insert(0, backend_dir)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = get_wsgi_application()
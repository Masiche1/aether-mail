#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


# The email domain app currently uses the legacy package name ``email``.
# Load the standard-library package before Django starts so email.utils resolves correctly.
backend_dir = os.path.dirname(os.path.abspath(__file__))
backend_key = os.path.normcase(backend_dir)
sys.path[:] = [entry for entry in sys.path if os.path.normcase(os.path.abspath(entry or os.getcwd())) != backend_key]
import email  # noqa: E402
sys.path.insert(0, backend_dir)


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

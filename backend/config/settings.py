import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-only-change-me')
DEBUG = os.getenv('DEBUG', 'True').lower() in {'1', 'true', 'yes'}
ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', 'aether-mail.onrender.com','localhost,127.0.0.1').split(',') if host.strip()]

INSTALLED_APPS = [
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'corsheaders',
	'rest_framework',
	'rest_framework.authtoken',
	'accounts',
	'organizations',
	'audit',
	'campaigns',
	'contacts',
	'domains',
	'suppressions',
	'media',
	'mailboxes',
	'email_delivery',
	'smtp',
]

MIDDLEWARE = [
	'corsheaders.middleware.CorsMiddleware',
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'config.urls'
TEMPLATES = [{
	'BACKEND': 'django.template.backends.django.DjangoTemplates',
	'DIRS': [],
	'APP_DIRS': True,
	'OPTIONS': {'context_processors': [
		'django.template.context_processors.request',
		'django.contrib.auth.context_processors.auth',
		'django.contrib.messages.context_processors.messages',
	]},
}]
WSGI_APPLICATION = 'config.wsgi.application'

database_url = os.getenv('DATABASE_URL', '')
if database_url.startswith('postgresql://'):
	from urllib.parse import urlparse
	parsed_database = urlparse(database_url)
	DATABASES = {'default': {
		'ENGINE': 'django.db.backends.postgresql',
		'NAME': parsed_database.path.lstrip('/'),
		'USER': parsed_database.username,
		'PASSWORD': parsed_database.password,
		'HOST': parsed_database.hostname,
		'PORT': parsed_database.port or 5432,
	}}
else:
	DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}

AUTH_USER_MODEL = 'accounts.User'
AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = 'en-us'
TIME_ZONE = os.getenv('TIME_ZONE', 'UTC')
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR.parent / 'media'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
	'DEFAULT_AUTHENTICATION_CLASSES': [
		'rest_framework.authentication.TokenAuthentication',
		'rest_framework.authentication.SessionAuthentication',
	],
	'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'],
}
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173').split(',') if origin.strip()]

CELERY_BROKER_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

if os.getenv('REDIS_URL'):
	CACHES = {'default': {'BACKEND': 'django.core.cache.backends.redis.RedisCache', 'LOCATION': os.getenv('REDIS_URL')}}
else:
	CACHES = {'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache', 'LOCATION': 'aethermail-cache'}}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'localhost')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '25'))
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'False').lower() in {'1', 'true', 'yes'}
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'False').lower() in {'1', 'true', 'yes'}
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@localhost')
SMTP_PROVIDER_DEFAULT_TYPE = os.getenv('SMTP_PROVIDER_DEFAULT_TYPE', 'namecheap')
SMTP_PROVIDER_DEFAULT_HOST = os.getenv('SMTP_PROVIDER_DEFAULT_HOST', 'mail.privateemail.com')
SMTP_PROVIDER_DEFAULT_PORT = int(os.getenv('SMTP_PROVIDER_DEFAULT_PORT', '465'))
SMTP_PROVIDER_DEFAULT_USERNAME = os.getenv('SMTP_PROVIDER_DEFAULT_USERNAME', '')
SMTP_PROVIDER_DEFAULT_PASSWORD = os.getenv('SMTP_PROVIDER_DEFAULT_PASSWORD', '')
SMTP_PROVIDER_DEFAULT_USE_TLS = os.getenv('SMTP_PROVIDER_DEFAULT_USE_TLS', 'False').lower() in {'1', 'true', 'yes'}
SMTP_PROVIDER_DEFAULT_USE_SSL = os.getenv('SMTP_PROVIDER_DEFAULT_USE_SSL', 'True').lower() in {'1', 'true', 'yes'}
BOUNCE_MAILDIR = os.getenv('BOUNCE_MAILDIR', '/var/mail/aethermail-bounces/new')

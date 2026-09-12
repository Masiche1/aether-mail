from django.contrib import admin
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path


def health(_request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health', health, name='health'),
    path('api/auth/', include('accounts.urls')),
    path('api/organizations/', include('organizations.urls')),
    path('api/audit-logs/', include('audit.urls')),
    path('api/campaigns/', include('campaigns.urls')),
    path('api/templates/', include('campaigns.template_urls')),
    path('api/media/', include('media.urls')),
    path('api/contacts/', include('contacts.urls')),
    path('api/domains/', include('domains.urls')),
    path('api/suppressions/', include('suppressions.urls')),
    path('api/messages/', include('email_delivery.urls')),
    path('api/mailboxes/', include('mailboxes.urls')),
    path('api/smtp/', include('smtp.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
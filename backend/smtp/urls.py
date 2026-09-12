from django.urls import path

from .views import SmtpProviderViewSet

urlpatterns = [
    path('providers/', SmtpProviderViewSet.as_view({'get': 'list'}), name='smtp-provider-list'),
]

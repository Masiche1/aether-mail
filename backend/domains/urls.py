from django.urls import path

from .views import SendingDomainHealthView, SendingDomainListCreateView, SendingDomainVerifyView

urlpatterns = [
    path('', SendingDomainListCreateView.as_view(), name='domain-list'),
    path('<int:pk>/verify/', SendingDomainVerifyView.as_view(), name='domain-verify'),
    path('<int:pk>/health/', SendingDomainHealthView.as_view(), name='domain-health'),
]
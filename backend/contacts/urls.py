from django.urls import path

from .views import ContactListCreateView

urlpatterns = [path('', ContactListCreateView.as_view(), name='contact-list')]
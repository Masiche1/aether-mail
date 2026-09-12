from django.urls import path

from .views import SuppressionListCreateView

urlpatterns = [path('', SuppressionListCreateView.as_view(), name='suppression-list')]
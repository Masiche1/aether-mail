from django.urls import path

from .views import TemplateListCreateView

urlpatterns = [path('', TemplateListCreateView.as_view(), name='template-list')]

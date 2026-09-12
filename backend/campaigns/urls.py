from django.urls import path

from .views import CampaignAttachmentView, CampaignDetailView, CampaignDispatchView, CampaignListCreateView

urlpatterns = [
    path('', CampaignListCreateView.as_view(), name='campaign-list'),
    path('<int:pk>/', CampaignDetailView.as_view(), name='campaign-detail'),
    path('<int:pk>/dispatch/', CampaignDispatchView.as_view(), name='campaign-dispatch'),
    path('<int:pk>/attachments/', CampaignAttachmentView.as_view(), name='campaign-attachments'),
]

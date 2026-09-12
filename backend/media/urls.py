from django.urls import path

from .views import MediaAssetListCreateView

urlpatterns = [path('', MediaAssetListCreateView.as_view(), name='media-list')]
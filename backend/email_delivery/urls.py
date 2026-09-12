from django.urls import path

from .views import DirectSendView, EmailMessageListView

urlpatterns = [
	path('', EmailMessageListView.as_view(), name='message-list'),
	path('send/', DirectSendView.as_view(), name='message-send'),
]

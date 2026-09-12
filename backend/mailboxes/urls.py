from django.urls import path

from .views import MailboxAliasListCreateView, MailboxDetailView, MailboxListCreateView

urlpatterns = [
	path('', MailboxListCreateView.as_view(), name='mailbox-list'),
	path('<int:pk>/', MailboxDetailView.as_view(), name='mailbox-detail'),
	path('<int:mailbox_id>/aliases/', MailboxAliasListCreateView.as_view(), name='mailbox-aliases'),
]
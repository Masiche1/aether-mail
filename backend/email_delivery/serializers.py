from rest_framework import serializers

from .models import EmailMessage


class EmailMessageSerializer(serializers.ModelSerializer):
    delivery_status = serializers.CharField(source='delivery.status', read_only=True, default='pending')
    delivery_attempts = serializers.IntegerField(source='delivery.attempts', read_only=True, default=0)
    delivery_response = serializers.CharField(source='delivery.response', read_only=True, default='')

    class Meta:
        model = EmailMessage
        fields = ['id', 'campaign', 'mailbox', 'sender', 'recipient', 'subject', 'status', 'folder', 'headers', 'in_reply_to', 'created_at', 'sent_at', 'delivery_status', 'delivery_attempts', 'delivery_response']

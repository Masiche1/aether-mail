from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmailMessage
from .serializers import EmailMessageSerializer
from mailboxes.models import Mailbox
from workers.email_sender.task import send_email_task
from suppressions.models import Suppression


class DirectSendSerializer(serializers.Serializer):
    mailbox_id = serializers.IntegerField()
    recipient = serializers.EmailField()
    subject = serializers.CharField(max_length=998)
    body_text = serializers.CharField(required=False, allow_blank=True)
    body_html = serializers.CharField(required=False, allow_blank=True)


class EmailMessageListView(generics.ListAPIView):
    serializer_class = EmailMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EmailMessage.objects.filter(
            organization__memberships__user=self.request.user,
        ).select_related('delivery', 'campaign')


class DirectSendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = DirectSendSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mailbox = Mailbox.objects.get(
            pk=serializer.validated_data['mailbox_id'],
            organization__memberships__user=request.user,
            status='active',
        )
        if Suppression.objects.filter(
            organization=mailbox.organization,
            email__iexact=serializer.validated_data['recipient'],
        ).exists():
            return Response({'detail': 'Recipient is suppressed for this organization.'}, status=400)
        message = EmailMessage.objects.create(
            organization=mailbox.organization,
            mailbox=mailbox,
            sender=mailbox.email,
            recipient=serializer.validated_data['recipient'],
            subject=serializer.validated_data['subject'],
            body_text=serializer.validated_data.get('body_text', ''),
            body_html=serializer.validated_data.get('body_html', ''),
        )
        send_email_task.delay(message.pk)
        return Response(EmailMessageSerializer(message).data, status=201)

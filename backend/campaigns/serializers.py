from rest_framework import serializers

from .models import CampaignRecipient, EmailCampaign, EmailTemplate


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = ['id', 'name', 'subject', 'body_text', 'body_html', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignRecipientSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignRecipient
        fields = ['id', 'email', 'first_name', 'last_name', 'variables', 'status']
        read_only_fields = ['id', 'status']


class EmailCampaignSerializer(serializers.ModelSerializer):
    recipients = CampaignRecipientSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = EmailCampaign
        fields = [
            'id', 'name', 'sender', 'subject', 'body_text', 'body_html', 'template',
            'status', 'scheduled_at', 'created_at', 'updated_at', 'recipients',
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']

    def validate_template(self, template):
        if template.organization_id != self.context['request'].organization.id:
            raise serializers.ValidationError('Template is not available to this organization.')
        return template

    def create(self, validated_data):
        recipients = validated_data.pop('recipients', [])
        campaign = EmailCampaign.objects.create(
            organization=self.context['request'].organization,
            created_by=self.context['request'].user,
            **validated_data,
        )
        CampaignRecipient.objects.bulk_create([
            CampaignRecipient(campaign=campaign, **recipient) for recipient in recipients
        ])
        return campaign

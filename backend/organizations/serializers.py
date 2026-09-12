from rest_framework import serializers

from .models import Organization, OrganizationMembership


class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMembership
        fields = ['user', 'role', 'created_at']
        read_only_fields = ['user', 'created_at']


class OrganizationSerializer(serializers.ModelSerializer):
    memberships = MembershipSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'created_at', 'memberships']
        read_only_fields = ['created_at', 'memberships']
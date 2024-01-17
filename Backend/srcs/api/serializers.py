from django.contrib.auth.models import Group
from rest_framework import serializers
from login.models import UserProfile, Match


class UserProfileSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all())

    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'display_name', 'avatar',
                  'picture', 'is_2fa_enabled', 'is_online', 'groups']


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), many=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'display_name', 'avatar', 'username',
                  'picture', 'is_2fa_enabled', 'is_online', 'groups']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['match_id', 'id1', 'id2', 'winner', 'score1', 'score2']
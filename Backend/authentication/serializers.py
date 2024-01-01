from rest_framework import serializers
from authentication.models import UserProfile


class UserProfileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['url', 'username', 'email', 'groups', 'display_name',
                  'avatar', 'picture', 'is_2fa_enabled', 'is_online']

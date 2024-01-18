from django.contrib.auth.models import Group
from rest_framework import serializers
from login.models import UserProfile, Match, Tournament


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'




class UserSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(), many=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'email', 'display_name', 'avatar', 'username',
                  'picture', 'is_2fa_enabled', 'is_online', 'image', 'groups']


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = ['match_id', 'id1', 'id2', 'winner', 'score1', 'score2']
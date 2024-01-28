import random
from urllib.parse import quote
import os
from login.utils import get_user_token
from django.db import IntegrityError
from datetime import datetime
import requests
from login.models import UserProfile
from login.views import ssr_render
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import get_template
from django.template import Context, Template
from django.http import HttpResponse
from django.views.decorators.cache import never_cache
from django.contrib.auth.models import Group
from rest_framework import permissions, viewsets
from .serializers import GroupSerializer, UserSerializer, UserProfileSerializer, MatchSerializer, TournamentSerializer, FriendSerializer
from django.core.serializers import serialize
from login.models import UserProfile, Match, Tournament, Friendship
from django.db.models import Q
from django.forms.models import model_to_dict
from .serializers import GroupSerializer, UserSerializer
from django.core.serializers import serialize
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
import json
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from datetime import datetime, timezone
from django.contrib.sessions.models import Session
from faker import Faker
import secrets
import pyotp

BASE_DIR = settings.BASE_DIR
SECRET_KEY = settings.SECRET_KEY

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = UserProfile.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


# # ______________________________________________________________________________________
# # ______________________________________________________________________________________
# # TOOURNAMENT ENDPOINTS

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_tournaments(request):
    tourns = Tournament.objects.filter(Q(status=True))
    serializer = TournamentSerializer(tourns, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def two_fa_toggle(request):
    try:
        user = get_object_or_404(UserProfile, username=request.user.username)
        print(request.user.username)
        users_list = UserProfile.objects.all().exclude(username='admin')
    except:
        return JsonResponse({'message': 'UserProfile not found'}, status=400)

    template = get_template('user_profile.html')
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': user, 'users_list': users_list})

    rendered_template = template.render(context)
    return HttpResponse(rendered_template, content_type='text/html')


def intra_link(request):
    forty_two_url = settings.FORTY_TWO_URL
    return JsonResponse({'forty_two_url': forty_two_url})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    users = UserProfile.objects.exclude(username='admin')
    serializer = UserProfileSerializer(users, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    if request.FILES.get('image'):
        user = UserProfile.objects.get(username=request.user.username)
        user.image = request.FILES['image']
        user.save(update_fields=['image'])
        return JsonResponse({'message': 'Profile updated successfully'}, status=200)
    else:
        return JsonResponse({'error': 'Image not provided'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_display_name(request):
    if request.data.get('display_name'):
        print(request.data.get('display_name'))
        user = UserProfile.objects.get(username=request.user.username)
        user.nickname = request.data.get('display_name')
        user.save(update_fields=['nickname'])
        return JsonResponse({'message': 'Profile updated successfully'}, status=200)
    else:
        return JsonResponse({'error': 'nickname not provided'}, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    print(request.GET.get('username'))
    user = UserProfile.objects.get(username=request.GET.get('username'))
    users_list = UserProfile.objects.all().exclude(username='admin')

    template = get_template('user_profile.html')
    template_content = template.template.source
    template = Template(template_content)
    context = Context(
        {'user': user, 'users_list': users_list, 'messages': 'other'})

    rendered_template = template.render(context)
    return HttpResponse(rendered_template, content_type='text/html')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_friends(request, intra):
    user_friends = Friendship.objects.filter(
        Q(id1__intra=intra) | Q(id2__intra=intra))
    friend_intras = []

    for friend in user_friends:
        if friend.id1.intra == intra:
            friend_intras.append(friend.id2.intra)
        elif friend.id2.intra == intra:
            friend_intras.append(friend.id1.intra)
    jf = json.dumps(friend_intras)
    return HttpResponse(jf)


@api_view(['GET'])
@permission_classes((IsAuthenticated,))
def user_view(request, intra):
    try:
        user = get_object_or_404(UserProfile, username=intra)
        friendships = Friendship.objects.filter(
            Q(id1=user) | Q(id2=user)).all()
    except:
        return JsonResponse({'message': 'UserProfile not found'}, status=400)
    # @todo: get all friends in this list of friendships:

    # Get a list of unique friends
    friends_list = []
    for friendship in friendships:
        if friendship.id1 != user:
            friends_list.append(friendship.id1)
        else:
            friends_list.append(friendship.id2)

    # Remove duplicate friends
    unique_friends = list(set(friends_list))
    usernames_list = [friend.username for friend in unique_friends]

    # Get a list of unique friends
    games_list = Match.objects.filter(Q(id1=user) | Q(id2=user)).all()

    template = get_template('user_profile.html')
    template_content = template.template.source
    template = Template(template_content)

    if request.user.username == intra:
        context = Context(
            {'user': user, 'users_list': unique_friends, 'games_list': games_list, 'user_tag': 'same', 'image': 'same'})
    elif request.user.username in usernames_list:
        context = Context(
            {'user': user, 'users_list': unique_friends, 'games_list': games_list, 'user_tag': 'other', 'image': 'other', 'is_friend': True})
    else:
        context = Context(
            {'user': user, 'users_list': unique_friends, 'games_list': games_list, 'user_tag': 'other', 'image': 'other', 'is_friend': False})

    rendered_template = template.render(context)
    return HttpResponse(rendered_template, content_type='text/html')


@api_view(['POST'])
def add_or_remove_friend(request):
    print(request.GET.get('user1'))
    print(request.GET.get('user2'))
    user1 = get_object_or_404(UserProfile, intra=request.GET.get('user1'))
    user2 = get_object_or_404(UserProfile, intra=request.GET.get('user2'))

    newFriend = False
    if (not Friendship.objects.filter(Q(id1=user1) & Q(id2=user2)).exists() and not Friendship.objects.filter(Q(id1=user2) & Q(id2=user1)).exists()):
        newFriend = True
        Friendship.objects.create(id1=user1, id2=user2)
    elif (Friendship.objects.filter(Q(id1=user1) & Q(id2=user2)).exists()):
        f = Friendship.objects.filter(Q(id1=user1) & Q(id2=user2))
        f.delete()
    elif (Friendship.objects.filter(Q(id1=user2) & Q(id2=user1)).exists()):
        f = Friendship.objects.filter(Q(id1=user1) & Q(id2=user2))
        f.delete()
    print("New friend :")
    print(newFriend)

    message = messages.info(
        request, 'Added' if newFriend else 'Removed')
    if newFriend:
        return HttpResponse("Added")
    return HttpResponse("Removed")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_tournament(request):
    name = request.GET.get('name')
    try:
        tourn = Tournament.objects.create(name=name, status=True)
        Match.objects.create(tournament_id_id=tourn.tournament_id,
                             id1_id=2, id2_id=3, score1=0, score2=0, ongoing=True)
        Match.objects.create(tournament_id_id=tourn.tournament_id,
                             id1_id=2, id2_id=3, score1=0, score2=0, ongoing=True)

    except:
        return JsonResponse({'message': 'Please choose another tournament name'}, status=200)
    return JsonResponse({'message': 'Tournament created successfully'}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_tournament(request):
    username = request.GET.get('username')
    tournament_name = request.GET.get('tournament_name')

    if not username or not tournament_name:
        return JsonResponse({'message': 'Both username and tournament_name are required.'}, status=200)

    user = get_object_or_404(UserProfile, intra=username)
    tourn = Tournament.objects.filter(Q(name=tournament_name)).get()

    joined = False
    games = Match.objects.filter(Q(tournament_id=tourn.tournament_id)).all()

    # Case 1: already in the tournament lobby:
    if (games[0].id1 == user or games[0].id2 == user):
        msg = "You are already in the tournament"
    elif (games[0].id1 == user or games[0].id2 == user):
        msg = "You are already in the tournament"
    # Case 2: Game 1 empty lobby
    elif (games[0].id1.id == 2):
        print("Found u a spot in game 1 buddy! - slot 1")
        g = Match.objects.get(match_id=games[0].match_id)
        g.id1 = user
        g.save()
        joined = True
    # Case 3: Game 1 half full lobby
    elif (games[0].id2.id == 3):
        print("Found u a spot in game 1 buddy! - slot 2")
        g = Match.objects.get(match_id=games[0].match_id)
        g.id2 = user
        g.save()
        joined = True
    # Case 4: Game 2 empty lobby
    elif (games[1].id1.id == 2):
        print("Found u a spot in game 2 buddy! - slot 1")
        g = Match.objects.get(match_id=games[1].match_id)
        g.id1 = user
        g.save()
        joined = True
    # Case 3: Game 2 half full lobby
    elif (games[1].id2.id == 3):
        print("Found u a spot in game 2 buddy! - slot 2")
        g = Match.objects.get(match_id=games[1].match_id)
        g.id2 = user
        g.save()
        joined = True
    else:
        msg = "Sorry, you're late. The tournament is full :/"
        return JsonResponse({'message': msg}, status=200)
    if joined:
        msg = 'Tournament joined successfully'
    return JsonResponse({'message': msg}, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enable_or_disable_2fa(request):
    user = get_object_or_404(UserProfile, username=request.user.username)
    user.is_2fa_enabled = not user.is_2fa_enabled
    user.save()

    if user.is_2fa_enabled:
        request.session['username'] = user.username
        return HttpResponse("2FA Enabled successfully")
    
    return HttpResponse("2FA disabled successfully")


@api_view(['POST'])
def validate_otp(request):
    user = get_object_or_404(UserProfile, username=request.user.username)
    otp = request.POST.get('otp')
    totp = pyotp.TOTP(user.otp_secret_key, interval=60)
    if otp and totp.verify(otp):
        current_datetime = datetime.now(timezone.utc)
        stored_datetime = user.otp_valid_date

        if current_datetime <= stored_datetime:
            auth_login(request, user)
            return JsonResponse({'message': 'OTP is valid'})

    return JsonResponse({'message': 'Invalid OTP'}, status=200)


@api_view(['GET'])
def generate_test_user(request):
    fake = Faker()
    username = fake.user_name()
    email = fake.email()
    display_name = fake.name()
    if not UserProfile.objects.filter(username=username).exists():
        profile = UserProfile.objects.create(
            username=username, intra=username, email=email, display_name=display_name, picture='https://picsum.photos/200/300')
    profile.set_password(username)
    profile.save()
    auth_login(request, profile)
    access_token = get_user_token(request, username, username)
    session_id = request.session.session_key
    user_data = {
        'username': profile.username,
        'email': profile.email,
        'display_name': profile.display_name,
        'nickname': profile.nickname,
    }
    return JsonResponse({'token': access_token, 'user': user_data, 'sessionId': session_id}, status=200)


@api_view(['GET'])
def get_user_data(request):
    session_id = request.COOKIES.get('sessionid')
    if session_id:
        username = request.session['username']
        user = get_object_or_404(UserProfile, username=username)
        user_data = {
            'username': user.username,
            'email': user.email,
            'display_name': user.display_name,
            'nickname': user.nickname,
        }
        return JsonResponse({'user_data': user_data})
    else:
        return JsonResponse({'error': 'Session ID not found'}, status=204)


@api_view(['GET'])
def get_image(request, username):
    user = get_object_or_404(UserProfile, username=username)
    if user.image:
        response = HttpResponse(user.image, content_type='image/png')
        return response
    return JsonResponse({'error': 'Image not found'}, status=204)

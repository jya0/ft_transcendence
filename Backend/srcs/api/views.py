from login.models import UserProfile
from login.views import ssr_render
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_tournaments(request):
    tourns = Tournament.objects.all()
    serializer = TournamentSerializer(tourns, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user_tournaments(request, intra):
    user_tourns = Match.objects.filter(~Q(tournament_id=1) & (
        Q(id1__intra=intra) | Q(id2__intra=intra))).distinct('tournament_id')
    serializer = MatchSerializer(user_tourns, many=True)
    return JsonResponse(serializer.data, safe=False)


BASE_DIR = settings.BASE_DIR


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    print(request.user.username)
    user_data = UserProfile.objects.filter(
        username=request.user.username).values()
    return JsonResponse(list(user_data), safe=False)


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


@never_cache
@api_view(['GET'])
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
        return JsonResponse({'error': 'Image not provided'}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    print(request.GET.get('username'))
    user = UserProfile.objects.get(username=request.GET.get('username'))
    users_list = UserProfile.objects.all().exclude(username='admin')
    # will be placed after getting friend list
    # ssr = ssr_render(request, 'user_profile.html', user, 'other')

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
@permission_classes([IsAuthenticated])
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

    template = get_template('user_profile.html')
    template_content = template.template.source
    template = Template(template_content)
    if request.user.username == intra:
        context = Context(
            {'user': user, 'users_list': unique_friends, 'user_tag': 'same', 'image': 'same'})
    else:
        context = Context(
            {'user': user, 'users_list': unique_friends, 'user_tag': 'other', 'image': 'other'})

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

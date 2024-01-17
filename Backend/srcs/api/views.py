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
from .serializers import GroupSerializer, UserSerializer
from django.core.serializers import serialize
from login.models import UserProfile, Match, Tournament
from django.db.models import Q
from django.forms.models import model_to_dict

# Create your views here.

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
@login_required
@permission_classes([IsAuthenticated])
def get_user_data(request):
    print(request.user.username)
    user_data = UserProfile.objects.filter(
        username=request.user.username).values()
    return JsonResponse(list(user_data), safe=False)


@api_view(['GET'])
@login_required
@permission_classes([IsAuthenticated])
def home_view(request):
    try:
        user = get_object_or_404(UserProfile, username=request.user.username)
        print("---------> ", user)
    except:
        return JsonResponse({'message': 'UserProfile not found'}, status=400)
    # Example template content
    template = get_template('home.html')
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': user})

    rendered_template = template.render(context)

    return HttpResponse(rendered_template, content_type='text/plain')


@never_cache
@api_view(['GET'])
def intra_link(request):
    forty_two_url = settings.FORTY_TWO_URL
    return JsonResponse({'forty_two_url': forty_two_url})





# ______________________________________________________________________________________
# ______________________________________________________________________________________
# USER ENDPOINTS

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_all_users(request):
    users = UserProfile.objects.exclude(username='admin')
    
    users_json = serialize('json', users)
    return JsonResponse(users_json, safe=False)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user_data(request, intra):
    user = UserProfile.objects.filter(Q(intra=intra)).all()
    user_json = serialize('json', user)
    return JsonResponse(user_json, safe=False)


# ______________________________________________________________________________________
# ______________________________________________________________________________________
# TOOURNAMENT ENDPOINTS

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_all_tournaments(request):
    tourns = Tournament.objects.all()
    tourns_json = serialize('json', tourns)
    return JsonResponse(tourns_json, safe=False)



@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user_tournaments(request, intra):
    user_tourns = Match.objects.filter(~Q(tournament_id=1) & (Q(id1__intra=intra) | Q(id2__intra=intra))).distinct('tournament_id')
    user_tourns_json = serialize('json', user_tourns)
    return JsonResponse(user_tourns_json, safe=False)

# ______________________________________________________________________________________
# ______________________________________________________________________________________
# GAME ENDPOINTS

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_all_games(request):
    games = Match.objects.all()
    games_json = serialize('json', games)
    return JsonResponse(games_json, safe=False)

@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user_games(request, intra):
    games = Match.objects.filter((Q(id1__intra=intra)| Q(id2__intra=intra)) & Q(ongoing=False) & Q(open_lobby=False))
    games_json = serialize('json', games)
    return JsonResponse(games_json, safe=False)


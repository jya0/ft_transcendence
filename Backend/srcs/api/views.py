from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.contrib.auth.decorators import login_required
from login.models import UserProfile
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
from django.views.decorators.csrf import csrf_exempt

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

    users_json = serialize('json', users)
    return JsonResponse(users_json, safe=False)


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


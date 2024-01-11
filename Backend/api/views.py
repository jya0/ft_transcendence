from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from django.contrib.auth.decorators import login_required
from authentication.models import UserProfile
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import get_template
from django.template import Context, Template
from django.http import HttpResponse
from django.views.decorators.cache import never_cache

# Create your views here.

BASE_DIR = settings.BASE_DIR


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
        return JsonResponse({'message': 'User not found'}, status=400)
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


def register_form(request):
    # Example template content
    template = get_template('register.html')
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': None})

    rendered_template = template.render(context)

    return HttpResponse(rendered_template, content_type='text/plain')

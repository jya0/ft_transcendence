from datetime import datetime, timedelta, timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import UserProfile
from django.views.decorators.cache import never_cache
from django.db import IntegrityError
from datetime import datetime
from django.template.loader import get_template
from django.template import Context, Template
from .utils import send_otp, get_user_token
import os
import requests
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.contrib.sessions.models import Session
from django.conf import settings


FORTY_TWO_URL = os.environ.get("FORTY_TWO_URL")
secret_key = settings.SECRET_KEY


@api_view(['get'])
def logout(request):
    auth_logout(request)
    return JsonResponse({'message': 'Logged out successfully'}, status=200)


def ssr_render(request, template_name, user, messages):
    template = get_template(template_name)
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': user, 'messages': messages})

    rendered_template = template.render(context)
    return HttpResponse(rendered_template, content_type='text/html')


@api_view(['get'])
def auth(request):
    code = request.GET.get("code")
    if code:
        print("code", code)
        data = {
            "grant_type": "authorization_code",
            "client_id": os.environ.get("FORTY_TWO_CLIENT_ID"),
            "client_secret": os.environ.get("FORTY_TWO_CLIENT_SECRET"),
            "code": code,
            "redirect_uri": os.environ.get("FORTY_TWO_REDIRECT_URI"),
        }
        auth_response = requests.post(
            "https://api.intra.42.fr/oauth/token", data=data)
        try:
            access_token = auth_response.json().get("access_token")
        except:
            return JsonResponse({'message': 'Invalid authorization code'}, status=400)
        user_response = requests.get(
            "https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
        try:
            username = user_response.json()["login"]
            email = user_response.json()["email"]
            display_name = user_response.json()["displayname"]
            nickname = display_name
            picture = user_response.json()["image"]
        except:
            response = JsonResponse(
                {'message': 'Failed to fetch user data in main'}, status=400)
            return response
        auth_users = ['ahassan', 'sali', 'rriyas', 'jyao']
        if username not in auth_users:
            return JsonResponse({'message': 'hacker', 'name': display_name}, status=200)

        if username:
            request.session['username'] = username
            if not UserProfile.objects.filter(username=username).exists():
                try:
                    user_profile = UserProfile.objects.create(
                        username=username,
                        email=email,
                        first_name=display_name.split()[0],
                        last_name=display_name.split()[1],
                        display_name=display_name,
                        nickname=nickname,
                        intra=email.split('@')[0],
                        picture=picture,
                        date_joined=datetime.now())
                    user_profile.set_password(secret_key)
                    user_profile.save()
                except IntegrityError:
                    return JsonResponse({'message': 'This email is already in use. Please choose a different one.'}, status=400)
            else:
                user_profile = UserProfile.objects.get(username=username)

            user_data = {
                'username': user_profile.username,
                'email': user_profile.email,
                'display_name': user_profile.display_name,
                'nickname': user_profile.nickname,
            }
            if user_profile.is_2fa_enabled:
                send_otp(request, username)
                access_token = get_user_token(request, username, secret_key)
                return JsonResponse({'otp': 'validate_otp', 'user': user_data, 'token': access_token}, status=200)

            auth_login(request, user_profile)
            access_token = get_user_token(request, username, secret_key)
            session_id = request.session.session_key
            return JsonResponse({'token': access_token, 'user': user_data, 'sessionId': session_id}, status=200)

        response = JsonResponse(
            {'message': 'Failed to fetch user data'}, status=400)
        return response
    else:
        response = JsonResponse({'message': 'Invalid code'}, status=400)
        return response

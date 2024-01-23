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
from .utils import send_otp, generate_jwt, verify_jwt, get_user_token
import os
import requests
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt


FORTY_TWO_URL = os.environ.get("FORTY_TWO_URL")


# Create your views here.
def home_view(request):
    return render(request, "home.html", {'FORTY_TWO_URL': FORTY_TWO_URL})


def logout(request):
    if request.user.is_authenticated:
        user = get_object_or_404(UserProfile, username=request.user.username)
        auth_logout(request)
        return JsonResponse({'message': 'Logged out successfully'}, status=200)
    return JsonResponse({'message': 'already logged out'}, status=200)


def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print(username, password)
        user = authenticate(request, username=username, password=password)
        print(user)
        if user is not None:
            request.session['username'] = username
            user = get_object_or_404(UserProfile, username=username)
            if user.is_2fa_enabled:
                send_otp(request)
                auth_login(request, user)
                return render(request, '2fa.html', {'user': user})
            auth_login(request, user)
            request.session['is_verified'] = True
            return redirect('/')
        else:
            messages.info(request, 'Username or password is incorrect')
    return redirect('/')


@api_view(['get'])
def auth(request):
    code = request.GET.get("code")
    print('got code ---------> ', code)
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
                {'message': 'Failed to fetch user data in main'}, status=200)
            return response
            return HttpResponseRedirect("https://localhost:8090/")
        if username:
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
                    user_profile.set_password(username)
                    user_profile.save()
                except IntegrityError:
                    return JsonResponse({'message': 'This email is already in use. Please choose a different one.'}, status=200)
            else:
                user_profile = UserProfile.objects.get(username=username)

            user_data = {
                'username': user_profile.username,
                'email': user_profile.email,
                'display_name': user_profile.display_name,
                'nickname': user_profile.nickname,
            }
            if user_profile.is_2fa_enabled:
                print('2fa enabled------------------->')
                send_otp(request, username)
                print("sent otp.....")
                access_token = get_user_token(request, username, username)
                return JsonResponse({'otp': 'validate_otp', 'user': user_data, 'token': access_token}, status=200)
                response = HttpResponseRedirect(
                    f"https://localhost:8090/desktop?otp=validate_otp&token={access_token}&username={username}")
                return response

            auth_login(request, user_profile)
            access_token = get_user_token(request, username, username)
            print("---------> token", access_token)
            print(
                f"https://localhost:8090/desktop?token={access_token}&user={username}")
            session_id = request.session.session_key
            return JsonResponse({'token': access_token, 'user': user_data, 'sessionId': session_id}, status=200)
            response = HttpResponseRedirect(
                f"https://localhost:8090/desktop?token={access_token}&user={username}")
            return response

        response = JsonResponse(
            {'message': 'Failed to fetch user data'}, status=400)
        return response
        return HttpResponseRedirect("https://localhost:8090/")
    else:
        response = JsonResponse({'message': 'Invalid code'}, status=400)
        return response
        return HttpResponseRedirect("https://localhost:8090/")


def twoFactor(request):
    if not request.user.is_authenticated:
        return redirect('/')
    user = get_object_or_404(
        UserProfile, username=request.session['username'])
    if request.method == 'POST':
        if not user.is_2fa_enabled:
            return redirect('/enable_or_disable_2fa')
        otp = request.POST.get('otp')
        print(otp)
        if otp:
            if request.session['otp_secret_key'] == otp:
                current_datetime = datetime.now()
                stored_datetime = datetime.fromisoformat(
                    request.session['otp_valid_date'])
                if current_datetime < stored_datetime:
                    print("OTP verified")
                    auth_login(request, user)
                    request.session['is_verified'] = True
                    return redirect('/', {'user': user})
                else:
                    messages.info(request, "OTP expired")
            else:
                messages.info(request, "Invalid OTP")
    return render(request, "2fa.html", {'user': user})


@api_view(['POST'])
def enable_or_disable_2fa(request):
    user = get_object_or_404(UserProfile, username=request.user.username)
    user.is_2fa_enabled = not user.is_2fa_enabled
    user.save()
    message = messages.info(
        request, '2FA enabled successfully' if user.is_2fa_enabled else '2FA disabled successfully')
    if user.is_2fa_enabled:
        request.session['username'] = user.username
        # response = ssr_render(
        #     request, 'enable_or_disable_2fa.html', user, message)
        return HttpResponse("2FA Enabled successfully")
    return HttpResponse("2FA disabled successfully")


@api_view(['POST'])
def validate_otp(request):
    user = get_object_or_404(UserProfile, username=request.user.username)
    print('user -   ---- > ', user.otp_secret_key)
    otp = request.POST.get('otp')
    print('get -   ---- > ', otp)
    if otp and user.otp_secret_key == otp:
        current_datetime = datetime.now(timezone.utc)
        stored_datetime = user.otp_valid_date
        print('stored_datetime date->', stored_datetime)
        print('current_datetime date->', current_datetime)

        if current_datetime <= stored_datetime:
            request.session['is_verified'] = True
            auth_login(request, user)
            return JsonResponse({'message': 'OTP is valid'})

    return JsonResponse({'message': 'Invalid OTP'}, status=200)


def ssr_render(request, template_name, user, messages):
    template = get_template(template_name)
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': user, 'messages': messages})

    rendered_template = template.render(context)
    return HttpResponse(rendered_template, content_type='text/html')

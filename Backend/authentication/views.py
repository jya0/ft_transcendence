from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from time import sleep
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.template.loader import get_template
from django.template import Context, Template
import requests
import os
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .models import UserProfile
import json
import os
from django.core.serializers.json import DjangoJSONEncoder
import qrcode
from pathlib import Path
from django.http import HttpResponse
from django.db import IntegrityError
from .utils import send_otp, generate_jwt, decode_jwt
from datetime import datetime
import secrets
import re
import pyotp
from django.views.decorators.cache import never_cache


BASE_DIR = Path(__file__).resolve().parent.parent


@login_required
def my_view(request):
    return render(request, "home.html")


def logout(request):
    if request.user.is_authenticated:
        user = get_object_or_404(UserProfile, username=request.user.username)
        auth_logout(request)
    return JsonResponse({'message': 'Logged out successfully'}, status=200)


def get_user_data(request):
    user_data = UserProfile.objects.filter(
        username=request.user.username).values()
    return JsonResponse(list(user_data), safe=False)


@never_cache
def auth(request):
    if request.method == "GET":
        code = request.GET.get("code")
        if code:
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
                picture = user_response.json()["image"]
            except:
                return JsonResponse({'message': 'Failed to fetch user data'}, status=400)
            if username:
                if not UserProfile.objects.filter(username=username).exists():
                    try:
                        user_profile = UserProfile.objects.create(
                            username=username,
                            email=email,
                            first_name=display_name.split()[0],
                            last_name=display_name.split()[1],
                            display_name=display_name,
                            picture=picture,
                            date_joined=datetime.now())
                        user_profile.save()
                    except IntegrityError:
                        return JsonResponse({'message': 'This email is already in use. Please choose a different one.'}, status=400)
                else:
                    user_profile = UserProfile.objects.get(username=username)

                # print("Jwt ---------> ", decode_jwt(generate_jwt(user_profile.id)))
                if user_profile.is_2fa_enabled:
                    request.session['username'] = username
                    send_otp(request)
                    print("sent otp.....")
                    return JsonResponse({'message': 'OTP sent to your email'}, status=200)

                auth_login(request, user_profile)
                response = HttpResponseRedirect("http://localhost/")
                return response

            else:
                if username != "admin":
                    messages.error(request, "Failed to fetch user data")
            return JsonResponse({'message': 'Failed to fetch user data'}, status=400)

        else:
            return JsonResponse({'message': 'Invalid method'}, status=400)
    else:
        return JsonResponse({'message': 'Invalid method'}, status=400)


def twoFactorView(request):
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


def login_view(request):
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


def register_view(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(username, email, password)
        if username:
            if not UserProfile.objects.filter(username=username).exists():
                try:
                    user_profile = UserProfile.objects.create(
                        username=username,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        display_name=first_name + " " + last_name,
                        picture="https://cdn.intra.42.fr/users/medium_default.png",
                        last_login=datetime.now(),
                        date_joined=datetime.now())
                    user_profile.set_password(password)
                    user_profile.save()
                except IntegrityError:
                    message = "This email is already in use. Please choose a different one."
                    messages.info(request, message)
                    return render(request, 'register.html', {'error': message})
                user = authenticate(
                    request, username=username, password=password)
                if user is not None:
                    auth_login(request, user)
                    return redirect('/')
                else:
                    messages.error(
                        request, 'Username or password is incorrect')
            else:
                messages.info(request, 'Username already exists')

    return render(request, 'register.html')


def enable_or_disable_2fa(request):
    if not request.user.is_authenticated:
        return redirect('/')
    print("user ----------> ", request.user.username)
    user = get_object_or_404(UserProfile, username=request.user.username)
    if request.method == 'POST':
        user.is_2fa_enabled = not user.is_2fa_enabled
        user.save()
        message = messages.info(
            request, '2FA enabled successfully' if user.is_2fa_enabled else '2FA disabled successfully')
        if user.is_2fa_enabled:
            request.session['username'] = user.username
            send_otp(request)
            print("sent otp.....")
            return redirect('/2fa')

        return redirect('/', {'error': message, 'user': user})
    return render(request, 'enable_or_disable_2fa.html', {'user': user})


BASE_DIR = settings.BASE_DIR


# a new era of SSR SPA
def home_view(request):
    user = get_object_or_404(UserProfile, username=request.user.username)
    # Example template content
    template = get_template('home.html')
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': user})

    rendered_template = template.render(context)

    return HttpResponse(rendered_template, content_type='text/plain')


def register_form(request):
    # Example template content
    template = get_template('register.html')
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': None})

    rendered_template = template.render(context)

    return HttpResponse(rendered_template, content_type='text/plain')


@never_cache
def intra_link(request):
    forty_two_url = os.environ.get('FORTY_TWO_URL')
    return JsonResponse({'forty_two_url': forty_two_url})

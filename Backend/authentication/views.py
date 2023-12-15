from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import requests
import os
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model
from .models import UserProfile
from django.http import JsonResponse
import json
import os
from django.core.serializers.json import DjangoJSONEncoder
from django.contrib.auth.models import User
import qrcode
from pathlib import Path
from django.http import HttpResponse
from django.db import IntegrityError
from .utils import send_otp
from datetime import datetime
import secrets
import re
import pyotp


BASE_DIR = Path(__file__).resolve().parent.parent


@login_required
def my_view(request):
    return render(request, "home.html")


def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    response = HttpResponseRedirect("/")
    response.delete_cookie('sessionid')
    return response


@login_required
def get_user_data(request):
    user_data = UserProfile.objects.filter(
        username=request.user.username).values()
    return JsonResponse(list(user_data), safe=False)


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
                messages.info(request, "Invalid authorization code")
                return redirect("/")
            user_response = requests.get(
                "https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
            try:
                username = user_response.json()["login"]
                email = user_response.json()["email"]
                display_name = user_response.json()["displayname"]
                picture = user_response.json()["image"]
            except:
                messages.info(request, "Failed to fetch user data")
                return redirect("/")
            User = get_user_model()
            if not User.objects.filter(username='admin').exists():
                superuser = User.objects.create_superuser(
                    'admin', 'admin@example.com', 'admin')
            if username:
                if not User.objects.filter(username=username).exists():
                    try:
                        user = User.objects.create_user(
                            username=username, email=email, password=username)
                        user_profile = UserProfile.objects.create(
                            user=user,
                            username=user.username,
                            email=user.email,
                            first_name=display_name.split()[0],
                            last_name=display_name.split()[1],
                            display_name=display_name,
                            picture=picture,
                            is_active=user.is_active,
                            last_login=user.last_login,
                            date_joined=user.date_joined,
                            password=user.password)
                        user_profile.save()
                    except IntegrityError as e:
                        message = str(e).split(':')[1]
                        messages.info(request, message)
                        user.delete()
                        return render(request, 'home.html', {'error': message})
                else:
                    user = User.objects.get(username=username)
                    user_profile = UserProfile.objects.get(user=user)

                authenticated_user = authenticate(
                    request, username=username, password=username)

                # displaying user details
                # atrribute = vars(user_profile)
                # for key, value in atrribute.items():
                #     print(key, ' : ', value)

                if authenticated_user is not None:
                    auth_login(request, authenticated_user)
                    response = HttpResponseRedirect("/")
                    return response
                else:
                    messages.error(request, "Authentication failed")
            else:
                if username != "admin":
                    messages.error(request, "Failed to fetch user data")
            return HttpResponseRedirect("/")

        else:
            messages.info(request, "Invalid authorization code")
            return redirect("/")
    else:
        messages.info(request, "Invalid method")
        return redirect("/")


def twoFactorView(request):
    if request.method == 'POST':
        otp = request.POST.get('otp')
        print(otp)
        if otp:
            if request.session['otp_secret_key'] == otp:
                current_datetime = datetime.now()
                stored_datetime = datetime.fromisoformat(
                    request.session['otp_valid_date'])
                if current_datetime < stored_datetime:
                    print("OTP verified")
                    user = get_object_or_404(
                        User, username=request.session['username'])
                    auth_login(request, user)
                    request.session['is_verified'] = True
                    return redirect('/')
                else:
                    messages.info(request, "OTP expired")
            else:
                messages.info(request, "Invalid OTP")
    return render(request, "2fa.html")


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print(username, password)
        user = authenticate(request, username=username, password=password)
        print(user)
        if user is not None:
            print("------------->>> login view", user)
            request.session['username'] = username
            send_otp(request)
            print("shouldn't be here---------->")
            return render(request, '2fa.html')
            # get_object_or_404(UserProfile, username=username)
            # auth_login(request, user)
            return redirect('/2fa')
        else:
            print("------------->>>", user)
            messages.info(request, 'Username OR password is incorrect')
    return redirect('/')


def register_view(request):
    if request.method == 'POST':
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(username, email, password)
        User = get_user_model()
        if username:
            if not User.objects.filter(username=username).exists():
                try:
                    user = User.objects.create_user(
                        username=username, email=email, password=username)
                    user_profile = UserProfile.objects.create(
                        user=user,
                        username=user.username,
                        email=user.email,
                        first_name=first_name,
                        last_name=last_name,
                        display_name=first_name + " " + last_name,
                        picture="https://cdn.intra.42.fr/users/medium_default.png",
                        is_active=user.is_active,
                        last_login=user.last_login,
                        date_joined=user.date_joined,
                        password=user.password)
                    user_profile.save()
                except Exception as e:
                    message = str(e).split(':')[1]
                    messages.info(request, message)
                    user.delete()
                    return render(request, 'register.html', {'error': message})
                user = authenticate(
                    request, username=username, password=password)
                if user is not None:
                    auth_login(request, user)
                    return redirect('/')
                else:
                    messages.error(
                        request, 'Username OR password is incorrect')
            else:
                messages.info(request, 'Username already exists')

    return render(request, 'register.html')


@login_required
def enableTwoFactorView(request, username):
    # if request.user.username != 'admin':
    if request.user.username != username:
        return HttpResponse('You are not authorized to view this page')
    return twoFactorView(request)


@login_required
def user_qr_code(request, username, random_string):
    print("------------->>>", request.user.username, username)
    if request.user.username != username:
        return HttpResponse('You are not authorized to view this page')
    # username = request.user.username

    # scanned_data = "otpauth://totp/YourApp:Username?secret=DHLW6DYQFW4VMUAYC6BE7VHJCWK7HUS6&issuer=YourApp&period=60"
    otp_base32 = pyotp.random_base32()
    print("------------->>>", otp_base32)
    totp = pyotp.TOTP(otp_base32, interval=60)
    otp = totp.now()
    print("------------->>>", otp)
    request.session['otp_secret_key'] = otp
    scanned_data = totp.provisioning_uri(
        name=username, issuer_name='Pongos')

    random_string = re.search(r'secret=([^&]+)', scanned_data)
    username = re.search(r'Username=([^&]+)', scanned_data)

    # print("------------->>>", random_string, username)
    # random_string = secrets.token_hex(8)
    qr_code = qrcode.make(f'{scanned_data}')
    qr_code_path = f'{BASE_DIR}/mediafiles/{username}{random_string}.png'
    qr_code.save(qr_code_path)
    # request_after = request.GET.get('otp', None)
    # print("------------->>>", request_after)
    totp = pyotp.TOTP(otp_base32)
    # if not totp.verify(otp_base32):
    #     return False
    with open(qr_code_path, 'rb') as f:
        return HttpResponse(f.read(), content_type='image/png')

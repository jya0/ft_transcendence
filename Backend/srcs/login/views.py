from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from .models import UserProfile
from django.views.decorators.cache import never_cache
from django.db import IntegrityError
from datetime import datetime

from .utils import send_otp, generate_jwt, verify_jwt, get_user_token
import os
import requests

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

@never_cache
def auth(request):
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
            response = JsonResponse(
                {'message': 'Failed to fetch user data'}, status=400)
            return HttpResponseRedirect("http://localhost:8090/")
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
                    user_profile.set_password(username)
                    user_profile.save()
                except IntegrityError:
                    return JsonResponse({'message': 'This email is already in use. Please choose a different one.'}, status=400)
            else:
                user_profile = UserProfile.objects.get(username=username)

            if user_profile.is_2fa_enabled:
                request.session['username'] = username
                send_otp(request)
                print("sent otp.....")
                return JsonResponse({'message': 'OTP sent to your email'}, status=200)

            auth_login(request, user_profile)
            access_token = get_user_token(request, username, username)
            response = HttpResponseRedirect(
                f"http://localhost:8090/?token={access_token}")
            return response

        response = JsonResponse(
            {'message': 'Failed to fetch user data'}, status=400)
        return HttpResponseRedirect("http://localhost:8090/")
    else:
        response = JsonResponse({'message': 'Invalid code'}, status=400)
        return HttpResponseRedirect("http://localhost:8090/")
    
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

def enable_or_disable_2fa(request):
    if not request.user.is_authenticated:
        return redirect('/')
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
from django.shortcuts import render, redirect
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
            access_token = auth_response.json()["access_token"]
            user_response = requests.get(
                "https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
            username = user_response.json()["login"]
            email = user_response.json()["email"]
            display_name = user_response.json()["displayname"]
            picture = user_response.json()["image"]
            User = get_user_model()
            if not User.objects.filter(username='admin').exists():
                superuser = User.objects.create_superuser(
                    'admin', 'admin@example.com', 'admin')
            if username:
                if not User.objects.filter(username=username).exists():
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
    print(request.user)
    return render(request, "2fa.html")


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        print(username, password)
        user = authenticate(request, username=username, password=password)
        print(user)
        if user is not None:
            print("------------->>>", user)
            auth_login(request, user)
            return redirect('/')
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
                user = authenticate(
                    request, username=username, password=password)
                print("------------->>>", user)
                if user is not None:
                    auth_login(request, user)
                    return redirect('/')
                else:
                    messages.error(
                        request, 'Username OR password is incorrect')
            else:
                messages.info(request, 'Username already exists')

    return render(request, 'register.html')

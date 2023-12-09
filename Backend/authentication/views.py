from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import requests
import os
from django.http import HttpResponseRedirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout, get_user_model


@login_required
def my_view(request):
    return render(request, "login.html")


def logout(request):
    if request.user.is_authenticated:
        auth_logout(request)
    response = HttpResponseRedirect("/")
    response.delete_cookie('sessionid')
    return response


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
                print("admin_user -> ", superuser)
            if username:
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(
                        username=username, email=email)
                    print("create -> ", user)
                else:
                    user = User.objects.get(username=username)
                    print("get -> ", user)

                authenticated_user = authenticate(
                    request, username=username)
                print("authenticated_user -> ", authenticated_user)
                if authenticated_user is not None:
                    auth_login(request, authenticated_user)
                    print("auth_login -------> ", authenticated_user)
                    print("id -----------> ", request.session.session_key)
                    response = HttpResponseRedirect("/")
                    return response
                else:
                    messages.error(request, "Authentication failed")
            else:
                if username != "admin":
                    messages.error(request, "Failed to fetch user data")
            print("this called ------------>")
            return HttpResponseRedirect("/")

        else:
            messages.info(request, "Invalid authorization code")
            return redirect("login")
    else:
        messages.info(request, "Invalid method")
        return redirect("login")

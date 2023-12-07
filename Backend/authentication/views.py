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


@login_required
def logout(request):
    if not request.user.is_authenticated:
        return redirect("/login")
    auth_logout(request)
    return redirect("/")


def auth(request):
    if request.user.is_authenticated:
        print("########## authed ############")
        return redirect("/")
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
            print("------- > ", auth_response.json(), "<----------")
            access_token = auth_response.json()["access_token"]
            user_response = requests.get(
                "https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
            username = user_response.json()["login"]
            display_name = user_response.json()["displayname"]
            print("----> USER -> ", username, display_name)
            User = get_user_model()
            if username:
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(
                        username=username, password=username)
                else:
                    user = User.objects.get(username=username)

                authenticated_user = authenticate(
                    request, username=username, password=username)
                if authenticated_user is not None:
                    auth_login(request, authenticated_user)
                    return HttpResponseRedirect("/")
                else:
                    messages.error(request, "Authentication failed")
            else:
                messages.error(request, "Failed to fetch user data")
            return HttpResponseRedirect("/")

        else:
            messages.info(request, "Invalid authorization code")
            return redirect("login")
    else:
        messages.info(request, "Invalid method")
        return redirect("login")

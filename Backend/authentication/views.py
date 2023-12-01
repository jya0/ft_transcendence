from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
import requests
import os


@login_required
def my_view(request):
    return render(request, "login.html")


def auth(request):
    if request.user.is_authenticated:
        return redirect("index")
    if request.method == "GET":
        code = request.GET.get("code")
        if code:
            data = {
                "grant_type": "authorization_code",
                "client_id": os.environ.get("FORTY_TWO_CLIENT_ID"),
                "client_secret": os.environ.get("FORTY_TWO_CLIENT_SECRET"),
                "code": code,
                "redirect_uri": "http://127.0.0.1:8000/auth",
            }
            auth_response = requests.post(
                "https://api.intra.42.fr/oauth/token", data=data)
            # Print the entire JSON response
            print("------- > ", auth_response.json(), "<----------")
            access_token = auth_response.json()["access_token"]
            user_response = requests.get(
                "https://api.intra.42.fr/v2/me", headers={"Authorization": f"Bearer {access_token}"})
            username = user_response.json()["login"]
            print("----> USER -> ", username)
            display_name = user_response.json()["displayname"]
            print("----> NAME -> ", display_name)
        else:
            messages.info(request, "Invalid authorization code")
            return redirect("login")
    else:
        messages.info(request, "Invalid method")
        return redirect("login")

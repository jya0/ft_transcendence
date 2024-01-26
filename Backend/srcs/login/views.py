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



def ssr_render(request, template_name, user, messages):
    template = get_template(template_name)
    template_content = template.template.source
    template = Template(template_content)
    context = Context({'user': user, 'messages': messages})

    rendered_template = template.render(context)
    return HttpResponse(rendered_template, content_type='text/html')

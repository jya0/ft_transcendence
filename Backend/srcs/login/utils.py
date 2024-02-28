import pyotp
from datetime import datetime, timedelta, timezone
from django.shortcuts import get_object_or_404
from .models import UserProfile
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import os
import requests

EMAIL_HOST = os.environ.get("EMAIL_HOST")


def send_otp(request, username):
    user = get_object_or_404(UserProfile, username=username)
    secret_key = pyotp.random_base32()
    totp = pyotp.TOTP(secret_key, interval=300)
    otp = totp.now()
    user.otp_secret_key = secret_key
    user.save()
    subject = "Your OTP"
    message = f"Your OTP is: {otp}"
    msg = MIMEMultipart()
    msg['From'] = EMAIL_HOST
    msg['To'] = user.email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login(EMAIL_HOST, os.environ.get("EMAIL_PASSWORD"))
        server.sendmail(EMAIL_HOST, user.email, msg.as_string())
    return otp


def get_user_token(request, username, password):
    base_url = os.environ.get("DJANGO_URL")

    data = {
        'username': username,
        'password': password,
    }
    json_data = json.dumps(data)
    response = requests.post(f"{base_url}/api/token/", data=json_data, headers={
        'Content-Type': 'application/json',
    })
    if response.status_code == 200:
        token_pair = response.json()
        access_token = token_pair['access']
        return access_token
    else:
        return None

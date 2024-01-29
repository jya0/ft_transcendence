import pyotp
from datetime import datetime, timedelta, timezone
from django.shortcuts import get_object_or_404
from .models import UserProfile
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import json
import base64
import hashlib
import hmac
import os
import requests

EMAIL_HOST = os.environ.get("EMAIL_HOST")


def send_otp(request, username):
    user = get_object_or_404(UserProfile, username=username)
    secret_key = pyotp.random_base32()
    totp = pyotp.TOTP(secret_key, interval=60)
    otp = totp.now()
    valid_date = datetime.now() + timedelta(minutes=2)
    user.otp_secret_key = secret_key
    valid_date_utc_aware = valid_date.replace(tzinfo=timezone.utc)
    user.otp_valid_date = valid_date_utc_aware
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
    # base_url = request.build_absolute_uri('/')[:-1]
    base_url = "http://localhost:8000"
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
        refresh_token = token_pair['refresh']
        print(f'Access Token: {access_token}')
        print(f'Refresh Token: {refresh_token}')
        return access_token
    else:
        print(response.json())
        print('Token generation failed.')
        return None

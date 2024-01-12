import pyotp
from datetime import datetime, timedelta
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

def send_otp(request):
    totp = pyotp.TOTP(pyotp.random_base32(), interval=60)
    otp = totp.now()
    request.session['otp_secret_key'] = otp
    print("OTP:", otp)
    valid_date = datetime.now() + timedelta(minutes=1)
    request.session['otp_valid_date'] = valid_date.isoformat()
    print(f"your otp is {otp} and it is valid for 1 minute")
    user = get_object_or_404(
        UserProfile, username=request.session['username'])
    subject = "Your OTP"
    message = f"Your OTP is: {otp}"
    msg = MIMEMultipart()
    msg['From'] = "42pongos@gmail.com"
    msg['To'] = user.email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login("42pongos@gmail.com", "hazmgnmudgrzrxey")
        server.sendmail("42pongos@gmail.com", user.email, msg.as_string())
    print("OTP sent successfully ", "send_otp view")

def generate_jwt(user_id):
    header = {
        "alg": "HS256",
        "typ": "JWT"
    }
    payload = {
        'user_id': user_id,
        'exp': (datetime.utcnow() + timedelta(minutes=1)).timestamp(),
    }
    encoded_header = base64.urlsafe_b64encode(
        json.dumps(header).encode('utf-8')).decode('utf-8')

    encoded_payload = base64.urlsafe_b64encode(
        json.dumps(payload).encode('utf-8')).decode('utf-8')

    secret_key = os.environ.get("JWT_SECRET", 'secret')
    signature = hmac.new(secret_key.encode('utf-8'),
                         f"{encoded_header}.{encoded_payload}".encode('utf-8'),
                         hashlib.sha256).digest()

    encoded_signature = base64.urlsafe_b64encode(signature).decode('utf-8')

    jwt_token = f"{encoded_header}.{encoded_payload}.{encoded_signature}"

    return jwt_token

def verify_jwt(token):

    parts = token.split('.')
    if len(parts) != 3:
        return False

    encoded_signature = parts[2].encode('utf-8')
    secret_key = os.environ.get("JWT_SECRET", 'secret')
    computed_signature = hmac.new(secret_key.encode('utf-8'),
                                  f"{parts[0]}.{parts[1]}".encode('utf-8'),
                                  hashlib.sha256).digest()
    computed_encoded_signature = base64.urlsafe_b64encode(computed_signature)
    if computed_encoded_signature != encoded_signature:
        return False
    payload = json.loads(base64.urlsafe_b64decode(
        parts[1] + '===').decode('utf-8'))
    expiration = payload.get('exp', 0)
    if expiration < datetime.utcnow().timestamp():
        return False
    return payload

def get_user_token(request, username, password):
    base_url = request.build_absolute_uri('/')[:-1]
    data = {
        'username': username,
        'password': password,
    }
    json_data = json.dumps(data)
    response = requests.post(f"{base_url}/api/token/", data=json_data, headers={
        'Content-Type': 'application/json'})
    if response.status_code == 200:
        token_pair = response.json()
        access_token = token_pair['access']
        refresh_token = token_pair['refresh']
        print(f'Access Token: {access_token}')
        print(f'Refresh Token: {refresh_token}')
        return access_token
    else:
        print('Token generation failed.')
        return None

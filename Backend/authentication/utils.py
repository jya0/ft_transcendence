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
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1),
    }

    encoded_payload = base64.urlsafe_b64encode(
        json.dumps(payload).encode('utf-8'))

    secret_key = os.environ.get("JWT_SECRET", 'secret')
    signature = hmac.new(secret_key.encode('utf-8'),
                         encoded_payload, hashlib.sha256).digest()
    encoded_signature = base64.urlsafe_b64encode(signature)

    jwt_token = f"{encoded_payload.decode('utf-8')}.{encoded_signature.decode('utf-8')}"

    return jwt_token


def decode_jwt(jwt_token):
    encoded_payload, encoded_signature = jwt_token.split('.')

    payload = json.loads(base64.urlsafe_b64decode(
        encoded_payload.encode('utf-8')).decode('utf-8'))

    secret_key = os.environ.get("JWT_SECRET", 'secret')
    expected_signature = base64.urlsafe_b64encode(hmac.new(secret_key.encode(
        'utf-8'), encoded_payload.encode('utf-8'), hashlib.sha256).digest())

    if encoded_signature == expected_signature:
        return payload
    else:
        raise ValueError('Invalid signature')

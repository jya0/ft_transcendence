import pyotp
from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart



def send_otp(request):
    print("otp -------->")
    totp = pyotp.TOTP(pyotp.random_base32(), interval=60)
    otp = totp.now()
    request.session['otp_secret_key'] = otp
    print("OTP:", otp)
    valid_date = datetime.now() + timedelta(minutes=1)
    request.session['otp_valid_date'] = valid_date.isoformat()
    print(f"your otp is {otp} and it is valid for 1 minute")
    user = get_object_or_404(
        User, username=request.session['username'])
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

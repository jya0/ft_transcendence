from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime

# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, unique=True, default="None")
    display_name = models.CharField(max_length=50, unique=False)
    first_name = models.CharField(max_length=50, default="None")
    last_name = models.CharField(max_length=50, default="None")
    email = models.TextField(unique=True, default="None")
    avatar = models.TextField(default="None")
    picture = models.CharField(max_length=1000, default="None")
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(auto_now=True)
    date_joined = models.DateTimeField(default=datetime(2023, 1, 1))
    password = models.CharField(max_length=100, default="None")

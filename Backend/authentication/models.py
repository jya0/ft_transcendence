from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.db import models
from django.db.models import JSONField

# Create your models here.


class UserProfile(AbstractUser):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=50, unique=False)
    avatar = models.TextField(default="None")
    picture = JSONField(default=dict)
    is_2fa_enabled = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)

    # USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.display_name

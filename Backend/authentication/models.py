from django.contrib.auth.models import BaseUserManager, AbstractUser, Group, Permission
from django.db import models
from django.db.models import JSONField

# Create your models here.


class UserProfile(AbstractUser):
    groups = models.ManyToManyField(Group, related_name='user_profiles')
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=50, unique=False)
    avatar = models.TextField(default="None")
    picture = JSONField(default=dict)
    is_2fa_enabled = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)

    # Use unique related names
    user_permissions = models.ManyToManyField(
        Permission, related_name='custom_user_profiles_permissions'
    )

    # USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.display_name

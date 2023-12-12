from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime
from django.contrib.auth.models import AbstractUser


# Create your models here.

class UserProfile(AbstractUser):
    bio = models.CharField(max_length=255, blank=True)
    display_name = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50, default="None")
    last_name = models.CharField(max_length=50, default="None")

    class Meta:
        permissions = (("can_do_something", "Can do something"),)

    groups = models.ManyToManyField(
        "auth.Group",
        verbose_name="groups",
        blank=True,
        help_text="The groups this user belongs to.",
        related_name="customuser_set",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        verbose_name="user permissions",
        blank=True,
        help_text="Specific permissions for this user.",
        related_name="customuser_set",
        related_query_name="user",
    )

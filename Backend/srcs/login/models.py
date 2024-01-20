from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.db.models import JSONField
from django.contrib.auth.models import Group, Permission


class UserProfile(AbstractUser):
    groups = models.ManyToManyField(Group, related_name='user_profiles')
    id = models.AutoField(primary_key=True)
    intra = models.CharField(max_length=50, unique=False)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=50, unique=False)
    nickname = models.CharField(max_length=50, unique=False)
    avatar = models.TextField(default="None")
    picture = JSONField(default=dict)
    is_2fa_enabled = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    image = models.ImageField(upload_to='mediafiles/', default='')
    otp_secret_key = models.CharField(max_length=16, default='')
    otp_valid_date = models.DateTimeField(default=None, blank=True, null=True)

    # Use unique related names
    user_permissions = models.ManyToManyField(
        Permission, related_name='custom_user_profiles_permissions'
    )

    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.display_name


class Settings(models.Model):
    avatar = models.TextField(default="None")
    display_name = models.CharField(
        max_length=50, unique=True, primary_key=True)
    id = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    is_2fa_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.display_name


class Friendship(models.Model):
    id = models.AutoField(primary_key=True)
    id1 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='user1')
    id2 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='user2')
    REQUIRED_FIELDS = ['id1', 'id2']


class Tournament(models.Model):
    winner = models.CharField(max_length=50, unique=False, default="1")
    tournament_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    status = models.BooleanField(default=False)


class Match(models.Model):
    open_lobby = models.BooleanField(default=True)
    match_id = models.AutoField(primary_key=True)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    id1 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='player1')
    id2 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='player2')
    winner = models.CharField(max_length=50)
    score1 = models.IntegerField()
    score2 = models.IntegerField()
    ongoing = models.BooleanField(default=False)

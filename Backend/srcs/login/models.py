from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser
from django.db.models import JSONField
from django.contrib.auth.models import Group, Permission


class UserProfile(AbstractUser):
    groups = models.ManyToManyField(Group, related_name='user_profiles')
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=50, unique=False)
    avatar = models.TextField(default="None")
    picture = JSONField(default=dict)
    is_2fa_enabled = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    image = models.ImageField(upload_to='mediafiles/', default='')

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
    intra = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    is_2fa_enabled = models.BooleanField(default=False)

    def __str__(self):
        return self.display_name


# no primary key - try to create a composite key
class Friendship(models.Model):
    intra1 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='user1')
    intra2 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='user2')

    def __str__(self):
        return (self.intra1 + self.intra2)


class Tournament(models.Model):
    intra = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    tournament_id = models.AutoField(primary_key=True)
    status = models.BooleanField(default=False)

    def __str__(self):
        return self.intra


class Match(models.Model):
    match_id = models.AutoField(primary_key=True)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    intra1 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='player1')
    intra2 = models.ForeignKey(
        UserProfile, on_delete=models.DO_NOTHING, related_name='player2')
    winner = models.CharField(max_length=50)
    score1 = models.IntegerField()
    score2 = models.IntegerField()

    def __str__(self):
        return self.match_id

# no primary key - try to create a composite key


class Nickname(models.Model):
    nick = models.CharField(max_length=50)
    intra = models.ForeignKey(UserProfile, on_delete=models.DO_NOTHING)
    tournament_id = models.ForeignKey(Tournament, on_delete=models.CASCADE)

    def __str__(self):
        return self.nick

from pathlib import Path
from django.urls import path
from django.contrib import admin
from .views import *


BASE_DIR = Path(__file__).resolve().parent.parent

urlpatterns = [
    path("auth/", auth, name="auth"),
    path("admin/", admin.site.urls),
    path('logout/', logout, name='logged_out'),
    path('2fa/', twoFactorView, name='2fa'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('enable_or_disable_2fa/', enable_or_disable_2fa,
         name='enable_or_disable_2fa'),

]

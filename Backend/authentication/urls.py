from pathlib import Path
from django.urls import path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from authentication.views import auth, logout, get_user_data, twoFactorView, login_view, register_view, enableTwoFactorView, user_qr_code, enable_or_disable_2fa
from django.contrib.auth.models import User
from django.http import HttpResponse
import qrcode


BASE_DIR = Path(__file__).resolve().parent.parent

urlpatterns = [
    path("auth/", auth, name="auth"),
    path("admin/", admin.site.urls),
    path('logout/', logout, name='logged_out'),
    path('get_user_data/', get_user_data, name='get_user_data'),
    path('2fa/', twoFactorView, name='2fa'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    # path('<str:username>/', enableTwoFactorView, name='user_two_factor'),
    # path('<str:username>/qr_code/', user_qr_code, name='user_qr_code'),
    path('<str:username>/<str:random_string>/',
         user_qr_code, name='user_qr_code'),
    path('enable_or_disable_2fa/', enable_or_disable_2fa,
         name='enable_or_disable_2fa'),
]

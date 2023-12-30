from pathlib import Path
from django.urls import path
from django.contrib import admin
from authentication.views import auth, logout, get_user_data, twoFactorView, login_view, register_view, enable_or_disable_2fa, home_view, register_form


BASE_DIR = Path(__file__).resolve().parent.parent

urlpatterns = [
    path("auth/", auth, name="auth"),
    path("admin/", admin.site.urls),
    path('logout/', logout, name='logged_out'),
    path('get_user_data/', get_user_data, name='get_user_data'),
    path('home/', home_view, name='2fa'),
    # for testing dinamic ssr spa routes
    path('contact/', home_view, name='2fa'),
    path('about/', home_view, name='2fa'),

    path('2fa/', twoFactorView, name='2fa'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('register_form/', register_form, name='register_form'),
    path('enable_or_disable_2fa/', enable_or_disable_2fa,
         name='enable_or_disable_2fa'),
]

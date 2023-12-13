from django.urls import path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from authentication.views import auth, logout, get_user_data, twoFactorView, login_view, register_view

urlpatterns = [
    path("auth/", auth, name="auth"),
    path("admin/", admin.site.urls),
    path('logout/', logout, name='logged_out'),
    path('get_user_data/', get_user_data, name='get_user_data'),
    path('2fa/', twoFactorView, name='2fa'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
]

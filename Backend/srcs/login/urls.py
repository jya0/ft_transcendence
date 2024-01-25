from django.urls import path
from . import views

urlpatterns = [
    # path("", views.login, name='login'),
    # path("auth/", views.auth, name="auth"),
    path('logout/', views.logout, name='logged_out'),
    path('2fa/', views.twoFactor, name='2fa'),
    path('login/', views.login, name='login'),
    # path('register/', views.register_view, name='register'),
    path('enable_or_disable_2fa/', views.enable_or_disable_2fa,
         name='enable_or_disable_2fa'),
    path('validate_otp/', views.validate_otp, name='validate_otp'),
]

from django.urls import path
from . import views

urlpatterns = [
    # path("", views.login, name='login'),
    # path("auth/", views.auth, name="auth"),
    path('2fa/', views.twoFactor, name='2fa'),
    path('login/', views.login, name='login'),
	path('api/logout/', views.logout, name='logout'),
    # path('register/', views.register_view, name='register'),
]

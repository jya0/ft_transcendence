from django.urls import path
from . import views

urlpatterns = [
    path("api/auth/", views.auth, name="auth"),
    path('api/logout/', views.logout, name='logout'),
]

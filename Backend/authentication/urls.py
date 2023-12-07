from django.urls import path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from authentication.views import auth, logout

urlpatterns = [
    path("auth/", auth, name="auth"),
    path("admin/", admin.site.urls),
    path('logout/', logout, name='logged_out'),
]

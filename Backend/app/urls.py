from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from rest_framework import routers
from restapi import views
from upload.views import main_view


router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)

urlpatterns = [
    path('', main_view, name="main-page"),
    path('', include(router.urls)),
    path("", include("authentication.urls")),
    path("", include("restapi.urls")),
    path("api/", include("api.urls")),

]

urlpatterns += router.urls

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)

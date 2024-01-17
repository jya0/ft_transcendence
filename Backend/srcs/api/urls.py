from django.urls import path
from . import views
from .views import *
from rest_framework import routers


from rest_framework.authtoken.views import obtain_auth_token
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'groups', views.GroupViewSet)


urlpatterns = [
    path("get_user_data/", get_user_data, name="get_user_data"),
    path("get_all_users/", get_all_users, name="get_all_users"),
    path("update_user_profile/", update_user_profile, name="update_user_profile"),
    path("two_fa_toggle/", two_fa_toggle, name='2fa_toggle'),
    path('42_intra_link/', intra_link, name='intra_link'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]

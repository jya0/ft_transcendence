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
    # path("users/", all_users_view, name="all_users_view"),
    # path("tournaments/<str:intra>", get_user_tournaments, name="get_user_tournaments"),
    path("auth/", auth, name="auth"),
    path('enable_or_disable_2fa/', views.enable_or_disable_2fa,
         name='enable_or_disable_2fa'),
    path('validate_otp/', views.validate_otp, name='validate_otp'),
    path('generate_test_user/', views.generate_test_user,
         name='generate_test_user'),

    path("tournaments/", get_all_tournaments, name="get_all_tournaments"),
    path("join/", join_tournament, name="join_tournament"),
    path("create_tournament/", create_tournament, name="create_tournament"),
    path("get_image/<str:username>/", get_image, name="get_image"),


    path("friends/<str:intra>", get_user_friends, name="get_user_friends"),

    path("users/<str:intra>", user_view, name="user_view"),
    path("get_user_data/", get_user_data, name="get_user_data"),

    path("get_all_users/", get_all_users, name="get_all_users"),
    path("update_user_profile/", update_user_profile, name="update_user_profile"),
    path("get_user_profile/", get_user_profile, name="get_user_profile"),
    path("update_display_name/", update_display_name, name="update_display_name"),
    path("two_fa_toggle/", two_fa_toggle, name='2fa_toggle'),
    path('42_intra_link/', intra_link, name='intra_link'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('toggle_friend/', add_or_remove_friend,
         name='add_or_remove_friend'),
]

from django.urls import path
from . import views
from .views import *
from rest_framework import routers

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenVerifyView,
)



urlpatterns = [
    # path("users/", all_users_view, name="all_users_view"),
    # path("tournaments/<str:intra>", get_user_tournaments, name="get_user_tournaments"),
    path('enable_or_disable_2fa/', views.enable_or_disable_2fa,
         name='enable_or_disable_2fa'),
    path('validate_otp/', views.validate_otp, name='validate_otp'),
	path('check_auth/', views.check_auth, name='check_auth'),

    path("tournaments/", get_all_tournaments, name="get_all_tournaments"),
    path("join/", join_tournament, name="join_tournament"),
    path("create_tournament/", create_tournament, name="create_tournament"),
    path("get_image/<str:username>/", get_image, name="get_image"),


    path("friends/<str:intra>", get_user_friends, name="get_user_friends"),

    path("users/<str:intra>", user_view, name="user_view"),
    path("get_user_data/", get_user_data, name="get_user_data"),

    path("get_all_users/", get_all_users, name="get_all_users"),
    path("update_user_profile/", update_user_profile, name="update_user_profile"),
    path("update_display_name/", update_display_name, name="update_display_name"),
    path('42_intra_link/', intra_link, name='intra_link'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('toggle_friend/', add_or_remove_friend,
         name='add_or_remove_friend'),
]

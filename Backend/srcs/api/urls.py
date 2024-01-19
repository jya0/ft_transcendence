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


# urlpatterns = [

#     path("tournaments/", get_all_tournaments, name="get_all_tournaments"),
#     path("tournaments/<str:intra>", get_user_tournaments, name="get_user_tournaments"),
#     path("games/", get_all_games, name="get_all_games"),
#     path("games/<str:intra>", get_user_games, name="get_user_games"),
#     path("friends/", get_all_friends, name="get_all_friends"),


#     path("update_user_profile/", update_user_profile, name="update_user_profile"),
#     path("get_user_profile/", get_user_profile, name="get_user_profile"),
#     path("two_fa_toggle/", two_fa_toggle, name='2fa_toggle'),
#     path('42_intra_link/', intra_link, name='intra_link'),
#     path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
# ]

urlpatterns = [
    # path("users/", all_users_view, name="all_users_view"),

    path("friends/<str:intra>", get_user_friends, name="get_user_friends"),

    path("users/<str:intra>", user_view, name="user_view"),
    path("get_user_data/", get_user_data, name="get_user_data"),

    path("get_all_users/", get_all_users, name="get_all_users"),
    path("update_user_profile/", update_user_profile, name="update_user_profile"),
    path("get_user_profile/", get_user_profile, name="get_user_profile"),
    path("two_fa_toggle/", two_fa_toggle, name='2fa_toggle'),
    path('42_intra_link/', intra_link, name='intra_link'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('toggle_friend/', add_or_remove_friend,
         name='add_or_remove_friend'),
]
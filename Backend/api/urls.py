from .views import *
from django.urls import path

urlpatterns = [
    path("get_user_data/", get_user_data, name="get_user_data"),
    path('register_form/', register_form, name='register_form'),
    path('home/', home_view, name='2fa'),
    path('42_intra_link/', intra_link, name='intra_link')
]

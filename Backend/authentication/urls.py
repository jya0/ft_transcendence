from pathlib import Path
from django.urls import path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from authentication.views import auth, logout, get_user_data, twoFactorView, login_view, register_view
from django.contrib.auth.models import User
from django.http import HttpResponse
import qrcode

urlpatterns = [
    path("auth/", auth, name="auth"),
    path("admin/", admin.site.urls),
    path('logout/', logout, name='logged_out'),
    path('get_user_data/', get_user_data, name='get_user_data'),
    path('2fa/', twoFactorView, name='2fa'),
    path('login/', login_view, name='login'),
    path('register/', register_view, name='register'),
]


BASE_DIR = Path(__file__).resolve().parent.parent

# Get all usernames of all users
users = User.objects.all()
for user in users:
    username = user.username
    qr_code = qrcode.make(f'{username+username}')
    qr_code_path = f'{BASE_DIR}/mediafiles/{username}_qr_code.png'
    qr_code.save(qr_code_path)
    if username != 'admin':
        urlpatterns.append(
            path(f'{username}', twoFactorView, name=f'{username}_url'))
    # qr_code_dir = '/path/to/save/'
    # os.makedirs(qr_code_dir, exist_ok=True)  # Create the directory if it doesn't exist
    # qr_code_path = os.path.join(qr_code_dir, f'{username}_qr_code.png')

    def user_qr_code(request):
        with open(qr_code_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/png')
    if username != 'admin':
        urlpatterns.append(
            path(f'{username}/qr_code/', user_qr_code, name=f'{username}_qr_code'))

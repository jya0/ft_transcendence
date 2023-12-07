# authentication/middleware.py

from django.shortcuts import redirect
from django.urls import reverse


class AuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated and not request.path.startswith('/admin'):
            return redirect(reverse("/"))  # Redirect to your login URL
        return self.get_response(request)

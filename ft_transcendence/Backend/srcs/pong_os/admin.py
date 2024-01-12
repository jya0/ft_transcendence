from django.contrib import admin
from login.models import UserProfile

class UserProfileAdmin(admin.ModelAdmin):
    # Exclude is_online from the admin interface
    exclude = ('is_online',)

admin.site.register(UserProfile)

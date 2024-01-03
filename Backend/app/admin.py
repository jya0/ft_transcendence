from django.contrib import admin
from authentication.models import UserProfile


class UserProfileAdmin(admin.ModelAdmin):
    # Exclude is_online from the admin interface
    exclude = ('is_online',)


# Register UserProfile with its admin configuration
admin.site.register(UserProfile, UserProfileAdmin)

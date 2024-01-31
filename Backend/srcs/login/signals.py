from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver


@receiver(user_logged_in)
def user_logged_in_handler(sender, request, user, **kwargs):
    if user is None:
        return
    user.is_online = True
    user.save(update_fields=['is_online'])


@receiver(user_logged_out)
def user_logged_out_handler(sender, request, user, **kwargs):
    if user is None:
        return
    user.is_online = False
    user.save(update_fields=['is_online'])

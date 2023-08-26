from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from tracker.models import Member


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_member_for_new_user(sender, **kwargs):
    if kwargs["created"]:
        Member.objects.create(user=kwargs["instance"])

        recipient_name = kwargs["instance"].first_name
        email = kwargs["instance"].email

        subject = 'Welcome to MoneyTracker'
        message = f'Hello {recipient_name},\n\nThank you for signing up your account: {kwargs["instance"].username}. We are glad to help you with your money save journey.\n\nLet us know your questions by calling 778-512-4998. Our service team is glad to help you! \n\nSincerely,\nMoneyTracker Development Team'
        from_email = 'zcc2280411284@gmail.com'
        recipient_list = [email]
        send_mail(subject, message,
                  from_email, recipient_list, fail_silently=False)

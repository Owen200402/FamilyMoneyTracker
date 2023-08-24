from django.conf import settings
from django.core.mail import send_mail, mail_admins, BadHeaderError
from django.db.models.signals import post_save
from django.dispatch import receiver
from tracker.models import Member


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_member_for_new_user(sender, instance, created, **kwargs):
    if created:
        Member.objects.create(user=instance)

        recipient_name = instance.username
        email = instance.email

        subject = 'Welcome to MoneyTracker'
        message = f'Hello {recipient_name},\n\nThank you for signing up your account. We are glad to help you with your money save journey.\n Let us know your questions by calling 778-512-4998. Our service team is glad to help you! \n\nSincerely,\nMoneyTracker Development Team'
        from_email = 'zcc2280411284@gmail.com'
        recipient_list = [email]

        try:
            send_mail(subject, message, from_email, recipient_list)
        except BadHeaderError:
            pass

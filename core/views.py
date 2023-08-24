from django.core.mail import send_mail, mail_admins, BadHeaderError
from django.shortcuts import render


def email(request):
    try:
        send_mail('subject', 'message',
                  'zcc2280411284@gmail.com', ['owen@gmail.com'])
    except BadHeaderError:
        pass
    return render(request, 'hello.html', {'name': 'Mosh'})

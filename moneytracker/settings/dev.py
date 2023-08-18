from .common import *

DEBUG = True

SECRET_KEY = 'django-insecure-20oi6k5$g)j#+pr$saao4xjs1b7l89ki0qiq*p=nee(sn!!3^j'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'moneykeeper',
        'HOST': 'localhost',
        'USER': 'root',
    }
}

EMAIL_HOST = 'localhost'
EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_PORT = 2525

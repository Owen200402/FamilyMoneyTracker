from .common import *

DEBUG = True

SECRET_KEY = 'django-insecure-20oi6k5$g)j#+pr$saao4xjs1b7l89ki0qiq*p=nee(sn!!3^j'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'moneykeeper',
        'HOST': 'localhost',
        'USER': 'root'
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'zcc2280411284@gmail.com'
EMAIL_HOST_PASSWORD = 'hpeseooouwprbged'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

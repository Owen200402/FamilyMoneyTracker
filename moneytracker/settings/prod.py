import os
import dj_database_url
from .common import *

DEBUG = False

SECRET_KEY = os.environ['SECRET_KEY']

ALLOWED_HOSTS = ['moneytracker-prod-9941b1d428c3.herokuapp.com']

DATABASES = {
    'default': dj_database_url.config()
}


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'zcc2280411284@gmail.com'
EMAIL_HOST_PASSWORD = 'hpeseooouwprbged'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

from .common import *
import dj_database_url


DEBUG = True

SECRET_KEY = 'django-insecure-20oi6k5$g)j#+pr$saao4xjs1b7l89ki0qiq*p=nee(sn!!3^j'

DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.mysql',
    #     'NAME': 'moneykeeper',
    #     'HOST': 'localhost',
    #     'USER': 'root'
    # }
    'default': dj_database_url.config(
        default=os.environ.get('JAWSDB_URL')
    )
}

AWS_ACCESS_KEY_ID = 'AKIAU2X2GVMVRWV3OR6H'
AWS_SECRET_ACCESS_KEY = '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'
AWS_STORAGE_BUCKET_NAME = 'moneytrackerbackend'
AWS_S3_SIGNATURE_NAME = 's3v4'
AWS_S3_REGION_NAME = 'us-east-1'
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_S3_VERITY = True
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'zcc2280411284@gmail.com'
EMAIL_HOST_PASSWORD = 'hpeseooouwprbged'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

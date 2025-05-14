from settings.base import *

DEBUG=True
ALLOWED_HOSTS = ['*']


DATABASES = {
    'default': {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "handy_links",
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST", default="127.0.0.1"),
        "PORT": config("PORT", default="5432"),
    }
}

INSTALLED_APPS += [
    'debug_toolbar',
]

MIDDLEWARE +=[
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

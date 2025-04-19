#from handy_links.settings.base import *
from .base import *


DEBUG=False

ADMINS = [
    ("Enrique Alemany", "alemanye04@gmail.com")
]

ALLOWED_HOSTS = ["*"]



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

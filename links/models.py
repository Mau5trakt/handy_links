from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class CustomUser(AbstractUser):
    avatar = models.URLField("Avatar", max_length=400)
    is_premium = models.BooleanField(default=False)

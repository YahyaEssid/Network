from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    content = models.CharField(max_length = 350)
    user = models.ForeignKey(User, on_delete = models.SET_NULL, null=True)
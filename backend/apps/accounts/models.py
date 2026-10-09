from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    class Role(models.TextChoices):
        RECEPCIONISTA = "RECEPCIONISTA", "Recepcionista"
        SUPERVISOR= "SUPERVISOR", "Supervisor"
        ADMIN = "ADMIN", "Admin"
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.RECEPCIONISTA)

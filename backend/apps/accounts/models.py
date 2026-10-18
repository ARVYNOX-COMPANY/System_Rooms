from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    class Role(models.TextChoices):
        RECEPCIONISTA = "RECEPCIONISTA", "Recepcionista"
        SUPERVISOR = "SUPERVISOR", "Supervisor"
        ADMIN = "ADMIN", "Admin"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pendiente"
        ACTIVE = "ACTIVE", "Activo"
        BLOCKED = "BLOCKED", "Bloqueado"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.RECEPCIONISTA)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    # Datos solicitados en el PDF
    telefono = models.CharField(max_length=20, blank=True, null=True)
    dni = models.CharField(max_length=20, blank=True, null=True, unique=True)
    domicilio = models.CharField(max_length=255, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)

    @property
    def edad(self):
        """Calcula la edad automáticamente en base a la fecha de nacimiento"""
        if not self.fecha_nacimiento:
            return None
        hoy = timezone.now().date()
        return hoy.year - self.fecha_nacimiento.year - (
            (hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day)
        )

    def save(self, *args, **kwargs):
        # Forzamos que si es superuser, el rol sea ADMIN y esté activo
        if self.is_superuser:
            self.role = self.Role.ADMIN
            self.status = self.Status.ACTIVE
        super().save(*args, **kwargs)
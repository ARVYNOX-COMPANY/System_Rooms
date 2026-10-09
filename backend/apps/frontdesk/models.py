from django.db import models
from apps.rooms.models import Habitacion
# Create your models here.

class Huesped(models.Model):
    nombre_completo = models.CharField(max_length = 100)
    Documento_identidad = models.CharField(max_length=20, blank = True)
    telefono=models.CharField(max_length=20, blank=True)
    email = models.EmailField(max_length=100, blank = True)

    class Meta: 
        db_table = "huespeddes"
        verbose_name_plural = "huéspedes"
    def __str__(self):
        return self.nombre_completo

class Reserva(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        CHECKIN = "CHECKIN", "En casa"
        CHECKOUT = "CHECKOUT", "Fuera de casa"
        CANCELADA = "CANCELADA", "Cancelada"
    huesped = models.ForeignKey(Huesped, on_delete=models.PROTECT, related_name="reservas")
    habitacion = models.ForeignKey(Habitacion, on_delete=models.PROTECT, related_name="reservas")
    fecha_entrada = models.DateField()
    fecha_salida = models.DateField()
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.PENDIENTE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table="reservas"
        constraints = [models.CheckConstraint(condition=models.Q(fecha_salida__gt=models.F("fecha_entrada")),name="reserva_salida_despues_de_entrada",)]

    def __str__(self):
        return f"Reserva {self.pk} - {self.huesped}"
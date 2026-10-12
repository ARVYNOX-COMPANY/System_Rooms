from django.db import models

from apps.rooms.models import Habitacion


class Huesped(models.Model):
    nombre_completo = models.CharField(max_length=100)
    documento_identidad = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = "huespedes"
        verbose_name = "Huésped"
        verbose_name_plural = "Huéspedes"

    def __str__(self):
        return f"{self.nombre_completo} ({self.documento_identidad})"


class Reserva(models.Model):
    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        CHECKIN = "CHECKIN", "En casa"
        CHECKOUT = "CHECKOUT", "Fuera de casa"
        CANCELADA = "CANCELADA", "Cancelada"

    huesped = models.ForeignKey(
        Huesped,
        on_delete=models.PROTECT,
        related_name="reservas",
        db_column="huesped_id",
    )
    habitacion = models.ForeignKey(
        Habitacion,
        on_delete=models.PROTECT,
        related_name="reservas",
        db_column="habitacion_id",
    )
    fecha_entrada = models.DateField()
    fecha_salida = models.DateField()
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reservas"
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(fecha_salida__gt=models.F("fecha_entrada")),
                name="reserva_salida_despues_de_entrada",
            ),
        ]

    def __str__(self):
        return f"Reserva #{self.pk} - {self.huesped.nombre_completo} ({self.estado})"
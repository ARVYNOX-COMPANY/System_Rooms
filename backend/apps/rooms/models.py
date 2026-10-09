from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models


class Habitacion(models.Model):
    class Estado(models.TextChoices):
        LIBRE = "LIBRE", "Libre"
        OCUPADA = "OCUPADA", "Ocupada"
        SUCIA = "SUCIA", "Sucia"

    class Tipo(models.TextChoices):
        SIMPLE = "SIMPLE", "Simple"
        DOBLE = "DOBLE", "Doble"
        SUITE = "SUITE", "Suite"
    numero = models.CharField(max_length=10, unique=True)
    tipo = models.CharField(max_length=20, choices=Tipo.choices)
    piso = models.PositiveSmallIntegerField(default=1)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.LIBRE)
    precio_base = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )

    class Meta:
        db_table = "habitaciones"
        ordering = ["piso", "numero"]
        verbose_name_plural = "habitaciones"

    def __str__(self):
        return f"{self.numero} - {self.get_tipo_display()} ({self.estado})"
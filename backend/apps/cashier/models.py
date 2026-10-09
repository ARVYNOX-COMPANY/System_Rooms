from django.conf import settings
from django.db import models

from apps.frontdesk.models import Reserva


from django.conf import settings
from django.db import models

from apps.frontdesk.models import Reserva


class TurnoCaja(models.Model):
    class Estado(models.TextChoices):
        ABIERTO = "ABIERTO", "Abierto"
        CERRADO = "CERRADO", "Cerrado"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="turnos"
    )
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    monto_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_esperado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monto_contado = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.ABIERTO)

    class Meta:
        db_table = "turnos_caja"
        constraints = [
            models.UniqueConstraint(
                fields=["usuario"],
                condition=models.Q(estado="ABIERTO"),
                name="un_turno_abierto_por_usuario",
            )
        ]


class Transaccion(models.Model):
    class Tipo(models.TextChoices):
        CARGO = "CARGO", "Cargo"
        PAGO = "PAGO", "Pago"

    class Metodo(models.TextChoices):
        EFECTIVO = "EFECTIVO", "Efectivo"
        TARJETA = "TARJETA", "Tarjeta"

    reserva = models.ForeignKey(Reserva, on_delete=models.PROTECT, related_name="transacciones")
    turno = models.ForeignKey(
        TurnoCaja, on_delete=models.PROTECT, null=True, blank=True, related_name="transacciones"
    )
    tipo = models.CharField(max_length=5, choices=Tipo.choices)
    metodo = models.CharField(max_length=10, choices=Metodo.choices, blank=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.CharField(max_length=255, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transacciones"
        ordering = ["fecha"]
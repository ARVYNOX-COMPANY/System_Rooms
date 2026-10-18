from decimal import Decimal
from rest_framework import serializers

class AbrirTurnoSerializer(serializers.Serializer):
    monto_inicial = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal("0.00")
    )

class CerrarTurnoSerializer(serializers.Serializer):
    monto_contado = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=Decimal("0.00")
    )

class ResumenTurnoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    estado = serializers.CharField()
    fecha_apertura = serializers.DateTimeField()
    fecha_cierre = serializers.DateTimeField(allow_null=True)
    monto_inicial = serializers.DecimalField(max_digits=10, decimal_places=2)
    efectivo = serializers.DecimalField(max_digits=10, decimal_places=2)
    tarjeta = serializers.DecimalField(max_digits=10, decimal_places=2)
    monto_esperado = serializers.DecimalField(max_digits=10, decimal_places=2)
    monto_contado = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    diferencia = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
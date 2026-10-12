from rest_framework import serializers

from .models import Habitacion
from .pricing import precio_para_tipo


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = ["id", "numero", "tipo", "piso", "estado", "precio_base"]
        read_only_fields = ["precio_base"]   # ← el cliente NO puede enviarlo

    def validate_estado(self, value):
        if value not in ["LIBRE", "OCUPADA", "SUCIA"]:
            raise serializers.ValidationError(
                "Estado inválido. Debe ser LIBRE, OCUPADA o SUCIA."
            )
        return value

    def create(self, validated_data):
        # Forzamos el precio según el tipo, ignorando lo que mande el cliente
        validated_data["precio_base"] = precio_para_tipo(validated_data["tipo"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si cambian el tipo, recalculamos el precio
        if "tipo" in validated_data:
            validated_data["precio_base"] = precio_para_tipo(validated_data["tipo"])
        return super().update(instance, validated_data)
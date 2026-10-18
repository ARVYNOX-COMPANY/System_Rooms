from rest_framework import serializers

from .models import Habitacion
from .pricing import precio_para_tipo


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = [
            "id",
            "numero",
            "tipo",
            "piso",
            "estado",
            "precio_base",
            "oculta",
            "en_mantenimiento",
        ]
        read_only_fields = ["precio_base"]

    def validate_estado(self, value):
        if value not in ["LIBRE", "OCUPADA", "SUCIA"]:
            raise serializers.ValidationError(
                "Estado inválido. Debe ser LIBRE, OCUPADA o SUCIA."
            )
        estado_actual = getattr(self.instance, "estado", None)
        if value == "OCUPADA" and estado_actual is None:
            raise serializers.ValidationError(
                "El estado OCUPADA solo cambia con check-in o check-out."
            )
        if estado_actual is not None and value != estado_actual:
            if "OCUPADA" in (value, estado_actual):
                raise serializers.ValidationError(
                    "El estado OCUPADA solo cambia con check-in o check-out."
                )
        return value

    def validate(self, attrs):
        if self.instance and self.instance.estado == Habitacion.Estado.OCUPADA:
            if attrs.get("oculta") or attrs.get("en_mantenimiento"):
                raise serializers.ValidationError(
                    "La habitación está ocupada; haz el check-out primero."
                )
        return attrs

    def create(self, validated_data):
        # Forzamos el precio según el tipo, ignorando lo que mande el cliente
        validated_data["precio_base"] = precio_para_tipo(validated_data["tipo"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Si cambian el tipo, recalculamos el precio
        if "tipo" in validated_data:
            validated_data["precio_base"] = precio_para_tipo(validated_data["tipo"])
        return super().update(instance, validated_data)
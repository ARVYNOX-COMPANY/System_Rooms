from rest_framework import serializers

from .models import Huesped, Reserva


class HuespedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Huesped
        fields = ["id", "nombre_completo", "documento_identidad", "telefono", "email"]


class ReservaSerializer(serializers.ModelSerializer):
    huesped = HuespedSerializer(read_only=True)
    habitacion_numero = serializers.CharField(source="habitacion.numero", read_only=True)

    class Meta:
        model = Reserva
        fields = [
            "id",
            "huesped",
            "habitacion",
            "habitacion_numero",
            "fecha_entrada",
            "fecha_salida",
            "estado",
            "created_at",
        ]
        read_only_fields = ["estado", "created_at"]


class CheckInSerializer(serializers.Serializer):
    """Input del formulario de check-in."""

    habitacion_id = serializers.IntegerField()
    nombre_completo = serializers.CharField(max_length=100)
    documento_identidad = serializers.CharField(max_length=20)
    telefono = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    fecha_salida = serializers.DateField()

    def validate_habitacion_id(self, value):
        from apps.rooms.models import Habitacion

        try:
            habitacion = Habitacion.objects.get(pk=value)
        except Habitacion.DoesNotExist:
            raise serializers.ValidationError("Habitación no encontrada.")

        if habitacion.estado != "LIBRE":
            raise serializers.ValidationError(
                f"La habitación {habitacion.numero} no está LIBRE "
                f"(estado actual: {habitacion.estado})."
            )
        return value

    def validate(self, data):
        if data["fecha_salida"] <= data.get("fecha_entrada", __import__("datetime").date.today()):
            raise serializers.ValidationError(
                {"fecha_salida": "La fecha de salida debe ser posterior a hoy."}
            )
        return data
from rest_framework import serializers

from .models import Habitacion


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = ["id", "numero", "tipo", "piso", "estado", "precio_base"]
        # read_only_fields = ["estado"]  --> estado tiene que ser modificable

    
    def validate_estado(self, value):
        if value not in ["LIBRE", "OCUPADA", "SUCIA"]:
            raise serializers.ValidationError("Estado inválido")
        return value
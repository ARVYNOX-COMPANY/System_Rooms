from rest_framework import serializers

from .models import Habitacion


class HabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habitacion
        fields = ["id", "numero", "tipo", "piso", "estado", "precio_base"]
        read_only_fields = ["estado"]  
from django.db import transaction
from config.exceptions import ReglasNegocio
from .models import Habitacion

estado = Habitacion.Estado
# Transiciones permitidas (ver diagrama): LIBRE -> OCUPADA -> SUCIA -> LIBRE
TRANSICIONES = {
    estado.LIBRE: {estado.OCUPADA},
    estado.OCUPADA: {estado.SUCIA},
    estado.SUCIA: {estado.LIBRE},
}

def cambiar_estado(habitacion: Habitacion, nuevo: str) -> Habitacion:
    if nuevo not in TRANSICIONES.get(habitacion.estado, set()):
        raise ReglasNegocio(
            "TRANSICIÓN_NO_PERMITIDA",
            f"No se puede cambiar el estado de {habitacion.estado} a {nuevo}"
        )
    habitacion.estado = nuevo
    habitacion.save()
    return habitacion

def marcar_limpia(habitacion_id) -> Habitacion:
    with transaction.atomic():
        habitacion = Habitacion.objects.select_for_update().get(pk=habitacion_id)
        return cambiar_estado(habitacion, estado.LIBRE)

def marcar_ocupada(habitacion_id) -> Habitacion:
    with transaction.atomic():
        habitacion = Habitacion.objects.select_for_update().get(pk=habitacion_id)
        return cambiar_estado(habitacion, estado.OCUPADA)

def marcar_sucia(habitacion_id) -> Habitacion:
    with transaction.atomic():
        habitacion = Habitacion.objects.select_for_update().get(pk=habitacion_id)
        return cambiar_estado(habitacion, estado.SUCIA)

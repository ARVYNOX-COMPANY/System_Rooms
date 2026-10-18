from datetime import date
from django.utils import timezone
from django.db import transaction
from apps.rooms.models import Habitacion
from .models import Huesped, Reserva


@transaction.atomic
def registrar_checkin(
    *,
    habitacion_id: int,
    nombre_completo: str,
    documento_identidad: str,
    telefono: str = "",
    email: str = "",
    fecha_salida: date,
) -> Reserva:
    """
    Registra un check-in completo en una sola transacción:
      1. Busca o crea el Huésped (por documento_identidad)
      2. Crea la Reserva con estado CHECKIN
      3. Cambia la Habitación a OCUPADA

    Si algo falla en el medio, se revierte todo (atomic).
    """
    # 1. Huésped: get_or_create por documento
    huesped, _ = Huesped.objects.get_or_create(
        documento_identidad=documento_identidad,
        defaults={
            "nombre_completo": nombre_completo,
            "telefono": telefono or None,
            "email": email or None,
        },
    )

    # 2. Bloquear la habitación con select_for_update para evitar
    #    que dos recepcionistas hagan check-in simultáneo a la misma
    habitacion = Habitacion.objects.select_for_update().get(pk=habitacion_id)

    if habitacion.estado != "LIBRE":
        raise ValueError(
            f"La habitación {habitacion.numero} no está LIBRE "
            f"(estado actual: {habitacion.estado})."
        )

    # 3. Crear la reserva
    reserva = Reserva.objects.create(
        huesped=huesped,
        habitacion=habitacion,
        fecha_entrada=date.today(),
        fecha_salida=fecha_salida,
        estado=Reserva.Estado.CHECKIN,
    )

    # 4. Cambiar estado de la habitación
    habitacion.estado = "OCUPADA"
    habitacion.save(update_fields=["estado"])

    return reserva


@transaction.atomic
def registrar_checkout(reserva_id: int) -> Reserva:
    """
    Cierra la reserva y pasa la habitación a SUCIA.
    """
    reserva = (
        Reserva.objects.select_for_update()
        .select_related("habitacion")
        .get(pk=reserva_id)
    )

    if reserva.estado != Reserva.Estado.CHECKIN:
        raise ValueError(
            f"La reserva no está activa (estado actual: {reserva.estado})."
        )

    reserva.estado = Reserva.Estado.CHECKOUT
    reserva.save(update_fields=["estado"])

    habitacion = reserva.habitacion
    habitacion.estado = "SUCIA"
    habitacion.save(update_fields=["estado"])

    return reserva

@transaction.atomic
def cancelar_reserva(reserva_id: int) -> Reserva:
    reserva = (
        Reserva.objects.select_for_update()
        .select_related("habitacion")
        .get(pk=reserva_id)
    )

    if reserva.estado not in (Reserva.Estado.PENDIENTE, Reserva.Estado.CHECKIN):
        raise ValueError(
            f"No se puede cancelar una reserva en estado {reserva.estado}."
        )

    estaba_en_casa = reserva.estado == Reserva.Estado.CHECKIN

    reserva.estado = Reserva.Estado.CANCELADA
    reserva.save(update_fields=["estado"])

    habitacion = reserva.habitacion
    if estaba_en_casa and habitacion.estado == "OCUPADA":
        habitacion.estado = "LIBRE"
        habitacion.save(update_fields=["estado"])

    return reserva

@transaction.atomic
def cambiar_fecha_salida(reserva_id: int, nueva_fecha_salida: date) -> Reserva:
    """
    Extiende (o acorta) la estadía de una reserva activa (CHECKIN).
    La nueva fecha de salida debe ser posterior a hoy.
    """
    reserva = Reserva.objects.select_for_update().get(pk=reserva_id)

    if reserva.estado != Reserva.Estado.CHECKIN:
        raise ValueError(
            f"Solo se puede cambiar la salida de una reserva activa "
            f"(estado actual: {reserva.estado})."
        )

    if nueva_fecha_salida <= timezone.localdate():
        raise ValueError("La nueva fecha de salida debe ser posterior a hoy.")

    reserva.fecha_salida = nueva_fecha_salida
    reserva.save(update_fields=["fecha_salida"])
    return reserva
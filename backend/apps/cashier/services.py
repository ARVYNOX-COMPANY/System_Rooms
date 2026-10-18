from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from config.exceptions import ReglasNegocio
from .models import Transaccion, TurnoCaja


def turno_abierto(usuario) -> TurnoCaja | None:
    return TurnoCaja.objects.filter(usuario=usuario, estado=TurnoCaja.Estado.ABIERTO).first()

def requerir_turno(usuario) -> TurnoCaja:
    turno = turno_abierto(usuario)
    if not turno:
        raise ReglasNegocio("TURNO_REQUERIDO", "Abre un turno de caja antes de cobrar")
    return turno


def abrir_turno(usuario, monto_inicial: Decimal) -> TurnoCaja:
    if turno_abierto(usuario):
        raise ReglasNegocio("TURNO_YA_ABIERTO", "Ya tienes un turno de caja abierto")
    return TurnoCaja.objects.create(usuario=usuario, monto_inicial=monto_inicial)


def total_por_metodo(turno: TurnoCaja, metodo: str) -> Decimal:
    total = turno.transacciones.filter(
        tipo=Transaccion.Tipo.PAGO, metodo=metodo
    ).aggregate(t=Sum("monto"))["t"]
    return total or Decimal("0.00")


def resumen(turno: TurnoCaja) -> dict:
    efectivo = total_por_metodo(turno, Transaccion.Metodo.EFECTIVO)
    tarjeta = total_por_metodo(turno, Transaccion.Metodo.TARJETA)
    return {
        "id": turno.id,
        "estado": turno.estado,
        "fecha_apertura": turno.fecha_apertura,
        "fecha_cierre": turno.fecha_cierre,
        "monto_inicial": turno.monto_inicial,
        "efectivo": efectivo,
        "tarjeta": tarjeta,
        "monto_esperado": turno.monto_inicial + efectivo,
        "monto_contado": turno.monto_contado,
        "diferencia": (
            turno.monto_contado - turno.monto_esperado
            if turno.monto_contado is not None
            else None
        ),
    }

def cerrar_turno(usuario, monto_contado: Decimal) -> TurnoCaja:
    with transaction.atomic():
        turno = requerir_turno(usuario)
        turno.monto_esperado = resumen(turno)["monto_esperado"]
        turno.monto_contado = monto_contado
        turno.fecha_cierre = timezone.now()
        turno.estado = TurnoCaja.Estado.CERRADO
        turno.save()
        return turno
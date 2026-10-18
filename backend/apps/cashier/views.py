"""Hola, aqui se crea las vistas para manejar los turnos de caja.
    lo de abrir turnos. cerrar turnos y ver el turno actual.
        """
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from . import services
from .serializers import AbrirTurnoSerializer, CerrarTurnoSerializer, ResumenTurnoSerializer


def _resumen(turno):
    return ResumenTurnoSerializer(services.resumen(turno)).data


@extend_schema(request=AbrirTurnoSerializer, responses={201: ResumenTurnoSerializer})
@api_view(["POST"])
def abrir_turno(request):
    data = AbrirTurnoSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    turno = services.abrir_turno(request.user, data.validated_data["monto_inicial"])
    return Response(_resumen(turno), status=status.HTTP_201_CREATED)

@extend_schema(responses=ResumenTurnoSerializer)
@api_view(["GET"])
def turno_actual(request):
    turno = services.requerir_turno(request.user)
    return Response(_resumen(turno))

@extend_schema(request=CerrarTurnoSerializer, responses=ResumenTurnoSerializer)
@api_view(["POST"])
def cerrar_turno(request):
    data = CerrarTurnoSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    turno = services.cerrar_turno(request.user, data.validated_data["monto_contado"])
    return Response(_resumen(turno))
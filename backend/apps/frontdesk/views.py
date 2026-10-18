from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import services
from .models import Reserva
from .serializers import CambiarSalidaSerializer, CheckInSerializer, ReservaSerializer

class ReservaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Solo lectura para listar reservas + acciones personalizadas
    para check-in y check-out.
    """

    queryset = Reserva.objects.select_related("huesped", "habitacion").all()
    serializer_class = ReservaSerializer
    permission_classes = [AllowAny]  # TEMPORAL para desarrollo

    @action(detail=False, methods=["post"], url_path="checkin")
    def checkin(self, request):
        """
        POST /api/v1/reservas/checkin/
        Crea huésped + reserva y cambia habitación a OCUPADA.
        """
        serializer = CheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reserva = services.registrar_checkin(**serializer.validated_data)
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            ReservaSerializer(reserva).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="checkout")
    def checkout(self, request, pk=None):
        """
        POST /api/v1/reservas/{id}/checkout/
        Cierra la reserva y pasa la habitación a SUCIA.
        """
        try:
            reserva = services.registrar_checkout(int(pk))
        except Reserva.DoesNotExist:
            return Response(
                {"detail": "Reserva no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ReservaSerializer(reserva).data)

    @action(detail=True, methods=["post"], url_path="cancelar")
    def cancelar(self, request, pk=None):
        """
        POST /api/v1/reservas/{id}/cancelar/
        Cambia la reserva a CANCELADA y libera la habitación si estaba ocupada.
        """
        try:
            reserva = services.cancelar_reserva(int(pk))
        except Reserva.DoesNotExist:
            return Response(
                {"detail": "Reserva no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ReservaSerializer(reserva).data)

    def partial_update(self, request, pk=None):
        """
        PATCH /api/v1/reservas/{id}/
        Extiende la estadía. Solo acepta {"fecha_salida": "AAAA-MM-DD"}.
        """
        serializer = CambiarSalidaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            reserva = services.cambiar_fecha_salida(
                int(pk), serializer.validated_data["fecha_salida"]
            )
        except Reserva.DoesNotExist:
            return Response(
                {"detail": "Reserva no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(ReservaSerializer(reserva).data)
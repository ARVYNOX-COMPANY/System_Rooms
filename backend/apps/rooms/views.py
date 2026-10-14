from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import services
from .models import Habitacion
from .serializers import HabitacionSerializer
from .pricing import PRECIOS_POR_TIPO


class HabitacionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer
    permission_classes = [AllowAny]  # TEMPORAL para desarrollo

    def get_queryset(self):
        qs = super().get_queryset()

        # En detail (retrieve / update / partial_update / delete)
        # siempre trabajamos sobre TODAS las habitaciones.
        # El filtro de 'oculta' solo aplica al listado.
        if self.action != "list":
            return qs

        estado = self.request.query_params.get("estado")
        piso = self.request.query_params.get("piso")
        oculta = self.request.query_params.get("oculta")
        todas = self.request.query_params.get("todas")

        # Por defecto en el listado: solo visibles
        if todas != "true":
            if oculta is None:
                qs = qs.filter(oculta=False)
            else:
                qs = qs.filter(oculta=oculta.lower() == "true")

        if estado:
            qs = qs.filter(estado=estado.upper())
        if piso:
            qs = qs.filter(piso=piso)

        return qs

    def create(self, request, *args, **kwargs):
        """
        Upsert: si ya existe una habitación con el mismo 'numero',
        la actualiza en lugar de crear un duplicado.
        """
        numero = request.data.get("numero")

        if numero:
            existente = Habitacion.objects.filter(numero=numero).first()
            if existente:
                serializer = self.get_serializer(
                    existente, data=request.data, partial=True
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(
                    {"updated": True, "habitacion": serializer.data},
                    status=status.HTTP_200_OK,
                )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {"updated": False, "habitacion": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(request=None, responses=HabitacionSerializer)
    @action(detail=True, methods=["post"], url_path="marcar-limpia")
    def marcar_limpia(self, request, pk=None):
        self.get_object()  # 404 si no existe
        habitacion = services.marcar_limpia(pk)
        return Response(HabitacionSerializer(habitacion).data)

    @action(detail=False, methods=["get"], url_path="precios-por-tipo")
    def precios_por_tipo(self, request):
        """Devuelve el mapa de precios por tipo. Público."""
        return Response(PRECIOS_POR_TIPO)

    @action(detail=False, methods=["post"], url_path="ocultar-piso")
    def ocultar_piso(self, request):
        """
        Oculta o muestra TODAS las habitaciones de un piso.
        Body: { "piso": 3, "oculta": true }
        """
        piso = request.data.get("piso")
        oculta = request.data.get("oculta", True)

        if piso is None:
            return Response(
                {"error": "El campo 'piso' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Normalizar booleano (por si viene como string desde el front)
        if isinstance(oculta, str):
            oculta = oculta.lower() == "true"
        else:
            oculta = bool(oculta)

        qs = Habitacion.objects.filter(piso=piso)
        total = qs.count()

        if total == 0:
            return Response(
                {"error": f"No hay habitaciones en el piso {piso}."},
                status=status.HTTP_404_NOT_FOUND,
            )

        actualizadas = qs.update(oculta=oculta)

        return Response(
            {
                "piso": piso,
                "oculta": oculta,
                "actualizadas": actualizadas,
                "habitaciones": HabitacionSerializer(qs, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


# class ReservaViewSet(
#     mixins.ListModelMixin,
#     mixins.RetrieveModelMixin,
#     mixins.CreateModelMixin,
#     mixins.UpdateModelMixin,
#     viewsets.GenericViewSet,
# ):
#     queryset = Reserva.objects.all()
#     serializer_class = ReservaSerializer
#     permission_classes = [AllowAny]  # TEMPORAL para desarrollo

#     def get_queryset(self):
#         qs = super().get_queryset()
#         estado = self.request.query_params.get("estado")
#         piso = self.request.query_params.get("piso")
#         if estado:
#             qs = qs.filter(estado=estado.upper())
#         if piso:
#             qs = qs.filter(piso=piso)
#         return qs
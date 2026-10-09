from drf_spectacular.utils import extend_schema
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import services
from .models import Habitacion
from .serializers import HabitacionSerializer


class HabitacionViewSet(mixins.ListModelMixin,mixins.RetrieveModelMixin,mixins.CreateModelMixin,mixins.UpdateModelMixin,viewsets.GenericViewSet):
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        estado = self.request.query_params.get("estado")
        piso = self.request.query_params.get("piso")
        if estado:
            qs = qs.filter(estado=estado.upper())
        if piso:
            qs = qs.filter(piso=piso)
        return qs

    @extend_schema(request=None, responses=HabitacionSerializer)
    @action(detail=True, methods=["post"], url_path="marcar-limpia")
    def marcar_limpia(self, request, pk=None):
        self.get_object()  # 404 si no existe
        habitacion = services.marcar_limpia(pk)
        return Response(HabitacionSerializer(habitacion).data)
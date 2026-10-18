from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    ReceptionistSerializer,
)

User = get_user_model()


# ---------- LOGIN / ME ----------

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({
        "id": u.id,
        "username": u.username,
        "role": u.role,
        "status": u.status,
        "is_superuser": u.is_superuser,
    })


# ---------- PERMISO CUSTOM: SOLO ADMIN ----------

class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_superuser
                or request.user.role == User.Role.ADMIN
            )
        )


# ---------- REGISTRO (público) ----------

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


# ---------- LISTA DE RECEPCIONISTAS (solo Admin) ----------

class ReceptionistListView(generics.ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = ReceptionistSerializer

    def get_queryset(self):
        return User.objects.filter(
            role=User.Role.RECEPCIONISTA
        ).order_by("first_name", "last_name")


# ---------- APROBAR / BLOQUEAR (solo Admin) ----------

class ReceptionistStatusView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk, role=User.Role.RECEPCIONISTA)
        new_status = request.data.get("status")

        if new_status not in [User.Status.ACTIVE, User.Status.BLOCKED]:
            return Response(
                {"error": "Estado inválido. Usa 'ACTIVE' o 'BLOCKED'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.status = new_status
        user.save()

        return Response(ReceptionistSerializer(user).data, status=status.HTTP_200_OK)
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# 1. SERIALIZER DE LOGIN

class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # 🔥 Blindaje: superuser siempre es ADMIN y ACTIVE, sin importar lo que haya en la DB
        is_admin = user.is_superuser or user.role == User.Role.ADMIN
        token["username"] = user.username
        token["role"] = User.Role.ADMIN if is_admin else user.role
        token["status"] = User.Status.ACTIVE if is_admin else user.status
        token["is_superuser"] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        is_admin = user.is_superuser or user.role == User.Role.ADMIN

        # Solo bloquear a recepcionistas/supervisores (el admin siempre pasa)
        if not is_admin:
            if user.status == User.Status.PENDING:
                raise serializers.ValidationError(
                    {"detail": "Tu cuenta está pendiente de aprobación por un administrador."}
                )
            if user.status == User.Status.BLOCKED:
                raise serializers.ValidationError(
                    {"detail": "Tu cuenta ha sido bloqueada. Contacta al administrador."}
                )

        data["username"] = user.username
        data["role"] = User.Role.ADMIN if is_admin else user.role
        data["status"] = User.Status.ACTIVE if is_admin else user.status
        data["is_superuser"] = user.is_superuser
        return data

# 2. SERIALIZER DE REGISTRO
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'telefono', 'dni', 'domicilio', 'fecha_nacimiento', 'password']

    def create(self, validated_data):
        # Por defecto, todo nuevo registro es RECEPCIONISTA y PENDIENTE
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            telefono=validated_data.get('telefono', ''),
            dni=validated_data.get('dni', ''),
            domicilio=validated_data.get('domicilio', ''),
            fecha_nacimiento=validated_data.get('fecha_nacimiento'),
            password=validated_data['password'],
            role=User.Role.RECEPCIONISTA,
            status=User.Status.PENDING
        )
        return user

# 3. SERIALIZER PARA EL PANEL DEL ADMIN
class ReceptionistSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()
    nombre_completo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'nombre_completo', 'email', 'telefono', 'dni', 'domicilio', 'edad', 'status', 'role']

    def get_nombre_completo(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username
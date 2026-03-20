from rest_framework import serializers
from apps.accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    """Read-only user representation sent to the frontend."""

    class Meta:
        model = User
        fields = ["id", "name", "email", "age", "country", "city", "is_admin", "is_client"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Frontend expects camelCase booleans
        data["isAdmin"] = data.pop("is_admin")
        data["isClient"] = data.pop("is_client")
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()


class RegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=1)
    age = serializers.CharField(allow_blank=True, required=False, default="")
    country = serializers.CharField(allow_blank=True, required=False, default="")
    city = serializers.CharField(allow_blank=True, required=False, default="")

    def validate_age(self, value):
        if value in ("", None):
            return None
        try:
            age = int(value)
            if age < 1 or age > 120:
                raise serializers.ValidationError("Edad inválida.")
            return age
        except (ValueError, TypeError):
            raise serializers.ValidationError("La edad debe ser un número.")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value


class UpdateMeSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(min_length=1, required=False, allow_blank=True)
    age = serializers.CharField(allow_blank=True, required=False, default="")
    country = serializers.CharField(allow_blank=True, required=False, default="")
    city = serializers.CharField(allow_blank=True, required=False, default="")

    def validate_age(self, value):
        if value in ("", None):
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            raise serializers.ValidationError("La edad debe ser un número.")

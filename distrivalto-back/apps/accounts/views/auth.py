from django.contrib.auth import (
    authenticate,
    login as auth_login,
    logout as auth_logout,
    update_session_auth_hash,
)
from rest_framework.decorators import api_view
from rest_framework import status

from apps.accounts.models import User
from apps.utils.response import error_response, success_response
from apps.accounts.serializers import LoginSerializer, RegisterSerializer, UpdateMeSerializer, UserSerializer
from apps.chats.models import Chat
from apps.chats.serializers import ChatListSerializer


def _session_key(request):
    """Return current session key, creating session if needed."""
    if not request.session.session_key:
        request.session.create()
    return request.session.session_key


def _anonymous_chats(request):
    """Chats stored in this anonymous session (not yet transferred to a user)."""
    sk = request.session.session_key
    if not sk:
        return Chat.objects.none()
    return Chat.objects.filter(
        session_key=sk, user__isnull=True, deleted_at__isnull=True
    ).order_by("-created_at")


@api_view(["GET"])
def session(request):
    """
    GET /api/session/
    Called on every app mount to restore auth state.
    Returns { user, chats[] } — chats list only (no messages).
    """
    # Ensure session exists so anonymous users get a persistent cookie
    _session_key(request)

    if request.user.is_authenticated:
        chats = Chat.objects.filter(
            user=request.user, deleted_at__isnull=True
        ).order_by("-created_at")
        return success_response({
            "user": UserSerializer(request.user).data,
            "chats": ChatListSerializer(chats, many=True).data,
        })

    # Anonymous user — return their session-scoped chats
    chats = _anonymous_chats(request)
    return success_response({
        "user": None,
        "chats": ChatListSerializer(chats, many=True).data,
    })


@api_view(["POST"])
def login(request):
    """
    POST /api/auth/login/
    Body: { email, password }
    Returns: { user, chats[] }
    """
    ser = LoginSerializer(data=request.data)
    if not ser.is_valid():
        return error_response("Datos inválidos.")

    user = authenticate(
        request,
        username=ser.validated_data["email"],
        password=ser.validated_data["password"],
    )
    if user is None:
        return error_response("Correo o contraseña incorrectos.", 401)

    # Transfer any anonymous chats to this user before login
    sk = request.session.session_key
    if sk:
        Chat.objects.filter(session_key=sk, user__isnull=True).update(user=user, session_key="")

    auth_login(request, user)

    chats = Chat.objects.filter(user=user, deleted_at__isnull=True).order_by("-created_at")
    return success_response({
        "user": UserSerializer(user).data,
        "chats": ChatListSerializer(chats, many=True).data,
    })


@api_view(["POST"])
def register(request):
    """
    POST /api/auth/register/
    Body: { name, email, password, age?, country?, city? }
    Returns: { user, chats[] }
    Transfers anonymous chats to the new account.
    """
    ser = RegisterSerializer(data=request.data)
    if not ser.is_valid():
        # Surface the first validation error in the `error` key the frontend expects
        first_error = next(iter(ser.errors.values()))[0]
        return error_response(str(first_error))

    d = ser.validated_data
    user = User.objects.create_user(
        email=d["email"],
        name=d["name"],
        password=d["password"],
        age=d.get("age"),
        country=d.get("country", "") or "",
        city=d.get("city", "") or "",
        is_client=True,
    )

    # Transfer anonymous session chats to the new user
    sk = request.session.session_key
    if sk:
        Chat.objects.filter(session_key=sk, user__isnull=True).update(user=user, session_key="")

    auth_login(request, user)

    chats = Chat.objects.filter(user=user, deleted_at__isnull=True).order_by("-created_at")
    return success_response({
        "user": UserSerializer(user).data,
        "chats": ChatListSerializer(chats, many=True).data,
    }, code=status.HTTP_201_CREATED)


@api_view(["POST"])
def logout(request):
    """POST /api/auth/logout/"""
    auth_logout(request)
    return success_response({"ok": True})


@api_view(["PATCH"])
def update_me(request):
    """
    PATCH /api/auth/me/
    Body: { current_password, name?, email?, password?, age?, country?, city? }
    Verifies current_password before applying any change.
    Returns: { user }
    """
    if not request.user.is_authenticated:
        return error_response("No autenticado.", 401)

    ser = UpdateMeSerializer(data=request.data)
    if not ser.is_valid():
        first_error = next(iter(ser.errors.values()))[0]
        return error_response(str(first_error))

    d = ser.validated_data
    user = request.user

    if not user.check_password(d["current_password"]):
        return error_response("Contraseña actual incorrecta.")

    if "name" in d:
        user.name = d["name"]
    if "email" in d and d["email"] != user.email:
        if User.objects.exclude(pk=user.pk).filter(email=d["email"]).exists():
            return error_response("Ese correo ya está en uso.")
        user.email = d["email"]
    if d.get("password"):
        user.set_password(d["password"])
    if "age" in d:
        user.age = d["age"]
    if "country" in d:
        user.country = d["country"] or ""
    if "city" in d:
        user.city = d["city"] or ""

    user.save()

    # Bug fix: keep session valid after password change
    # Without this, the session auth hash would mismatch and the user would be
    # logged out on the very next request.
    update_session_auth_hash(request, user)

    return success_response({"user": UserSerializer(user).data})

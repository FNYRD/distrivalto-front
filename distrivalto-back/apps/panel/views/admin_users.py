from rest_framework.decorators import api_view
from rest_framework import status
from apps.accounts.models import User
from apps.panel.views._helpers import require_admin
from apps.utils.response import error_response, success_response


@api_view(["GET", "POST"])
def admin_users(request):
    """
    GET  /api/admin/users/  → { admins: [{ id, email }] }
    POST /api/admin/users/  → { id, email }
    """
    err = require_admin(request)
    if err:
        return err

    if request.method == "GET":
        admins = User.objects.filter(is_admin=True, is_active=True).order_by("email")
        data = [{"id": u.id, "email": u.email} for u in admins]
        return success_response({"admins": data})

    # POST — create admin
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    if not email or not password:
        return error_response("Email y contraseña son requeridos.")
    if User.objects.filter(email=email).exists():
        return error_response("Ya existe un usuario con ese correo.")

    user = User.objects.create_user(
        email=email,
        name=email.split("@")[0],
        password=password,
        is_admin=True,
        is_client=False,
        is_staff=True,
    )
    return success_response({"id": user.id, "email": user.email}, code=status.HTTP_201_CREATED)


@api_view(["PATCH", "DELETE"])
def admin_user_detail(request, user_id):
    """
    PATCH  /api/admin/users/{id}/  → { id, email }
    DELETE /api/admin/users/{id}/  → { ok: true }
    """
    err = require_admin(request)
    if err:
        return err

    try:
        target = User.objects.get(id=user_id, is_admin=True)
    except User.DoesNotExist:
        return error_response("Administrador no encontrado.", 404)

    if request.method == "DELETE":
        if target.id == request.user.id:
            return error_response("No puedes eliminar tu propia cuenta.")
        target.delete()
        return success_response({"ok": True})

    # PATCH
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    if email:
        if User.objects.exclude(pk=target.pk).filter(email=email).exists():
            return error_response("Ese correo ya está en uso.")
        target.email = email
    if password:
        target.set_password(password)

    target.save()
    return success_response({"id": target.id, "email": target.email})

from rest_framework.decorators import api_view
from apps.chats.models import Chat
from apps.panel.serializers import AdminChatDetailSerializer, AdminChatListSerializer
from apps.panel.views._helpers import require_admin
from apps.utils.response import error_response, success_response


@api_view(["GET"])
def admin_chats(request):
    """GET /api/admin/chats/?offset=0&limit=10"""
    err = require_admin(request)
    if err:
        return err

    try:
        offset = int(request.query_params.get("offset", 0))
        limit = int(request.query_params.get("limit", 10))
    except ValueError:
        return error_response("Parámetros inválidos.")

    qs = Chat.objects.filter(deleted_at__isnull=True).select_related("user").order_by("-created_at")
    total = qs.count()
    chats = qs[offset : offset + limit]

    return success_response({
        "chats": AdminChatListSerializer(chats, many=True).data,
        "total": total,
    })


@api_view(["GET", "DELETE"])
def admin_chat_detail(request, chat_id):
    """GET /api/admin/chats/{id}/  |  DELETE /api/admin/chats/{id}/"""
    from django.utils import timezone

    err = require_admin(request)
    if err:
        return err

    try:
        chat = Chat.objects.select_related("user").prefetch_related("messages").get(
            id=chat_id, deleted_at__isnull=True
        )
    except Chat.DoesNotExist:
        return error_response("Chat no encontrado.", 404)

    if request.method == "DELETE":
        chat.deleted_at = timezone.now()
        chat.save(update_fields=["deleted_at"])
        return success_response({"ok": True})

    return success_response(AdminChatDetailSerializer(chat).data)

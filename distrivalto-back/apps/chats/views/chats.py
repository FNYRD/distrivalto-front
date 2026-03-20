from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework import status

from apps.chats.models import Chat, Message
from apps.utils.response import error_response, success_response
from apps.chats.serializers import ChatDetailSerializer, ChatListSerializer, MessageSerializer
from apps.chats.bot import get_bot_response


def _get_owner_filter(request):
    """Return Q-filter kwargs to scope chats to the current user or session."""
    if request.user.is_authenticated:
        return {"user": request.user}
    sk = request.session.session_key
    return {"session_key": sk, "user__isnull": True} if sk else None


@api_view(["POST"])
def create_chat(request):
    """
    POST /api/chats/
    Body: { type, message }
    Returns: { id, title, type, createdAt, messages: [user_msg, bot_msg] }

    Creates the chat, the first user message, and a mock bot response in one call.
    """
    chat_type = request.data.get("type", "consulta")
    message_text = request.data.get("message", "").strip()

    if not message_text:
        return error_response("El mensaje no puede estar vacío.")

    if chat_type not in ("consulta", "garantia"):
        return error_response("Tipo inválido.")

    title = message_text[:80]

    user = request.user if request.user.is_authenticated else None

    if not user:
        # Bug fix: guarantee a real session_key for anonymous users.
        # Without this, sk="" and ALL anonymous chats with no session share the
        # same key, making them indistinguishable across different browsers.
        if not request.session.session_key:
            request.session.create()
        sk = request.session.session_key
    else:
        sk = ""

    chat = Chat.objects.create(
        user=user,
        session_key=sk,
        title=title,
        type=chat_type,
    )

    Message.objects.create(chat=chat, role="user", content=message_text)
    bot_text = get_bot_response(chat_type, message_text)
    Message.objects.create(chat=chat, role="bot", content=bot_text)

    return success_response(ChatDetailSerializer(chat).data, code=status.HTTP_201_CREATED)


@api_view(["GET", "DELETE"])
def chat_detail(request, chat_id):
    """
    GET  /api/chats/{id}/  → full chat with messages
    DELETE /api/chats/{id}/  → soft-delete
    """
    filters = _get_owner_filter(request)
    if filters is None:
        return error_response("Sesión inválida.", 403)

    try:
        chat = Chat.objects.get(id=chat_id, deleted_at__isnull=True, **filters)
    except Chat.DoesNotExist:
        return error_response("Chat no encontrado.", 404)

    if request.method == "DELETE":
        chat.deleted_at = timezone.now()
        chat.save(update_fields=["deleted_at"])
        return success_response({"ok": True})

    return success_response(ChatDetailSerializer(chat).data)


@api_view(["POST"])
def send_message(request, chat_id):
    """
    POST /api/chats/{chatId}/messages/
    Body: { message }
    Returns: the bot Message object only (user msg is already in frontend state).
    """
    filters = _get_owner_filter(request)
    if filters is None:
        return error_response("Sesión inválida.", 403)

    try:
        chat = Chat.objects.get(id=chat_id, deleted_at__isnull=True, **filters)
    except Chat.DoesNotExist:
        return error_response("Chat no encontrado.", 404)

    message_text = request.data.get("message", "").strip()
    if not message_text:
        return error_response("El mensaje no puede estar vacío.")

    Message.objects.create(chat=chat, role="user", content=message_text)

    bot_text = get_bot_response(chat.type, message_text)
    bot_msg = Message.objects.create(chat=chat, role="bot", content=bot_text)

    return success_response(MessageSerializer(bot_msg).data, code=status.HTTP_201_CREATED)

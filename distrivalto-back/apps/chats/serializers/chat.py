from rest_framework import serializers
from apps.chats.models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "role", "content", "createdAt"]


class ChatListSerializer(serializers.ModelSerializer):
    """Lightweight — no messages. Used for sidebar list and session response."""

    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "type", "createdAt"]


class ChatDetailSerializer(serializers.ModelSerializer):
    """Full chat including all messages."""

    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "type", "createdAt", "messages"]

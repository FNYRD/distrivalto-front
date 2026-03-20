from rest_framework import serializers
from apps.chats.models import Chat, Message


class AdminMessageSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "role", "content", "createdAt"]


class AdminChatListSerializer(serializers.ModelSerializer):
    """Lightweight chat row for the admin chat list (no messages)."""

    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    country = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ["id", "title", "type", "country", "createdAt"]

    def get_country(self, obj):
        return obj.country  # property on Chat model


class AdminChatDetailSerializer(serializers.ModelSerializer):
    """Full chat with messages for the admin detail panel."""

    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    country = serializers.SerializerMethodField()
    messages = AdminMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "title", "type", "country", "createdAt", "messages"]

    def get_country(self, obj):
        return obj.country

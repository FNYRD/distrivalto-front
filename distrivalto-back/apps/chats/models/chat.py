from django.conf import settings
from django.db import models


class Chat(models.Model):
    CHAT_TYPES = [
        ("consulta", "Consulta"),
        ("garantia", "Garantía"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="chats",
    )
    # Used to track chats created by anonymous (not-yet-registered) visitors
    session_key = models.CharField(max_length=40, blank=True, default="", db_index=True)

    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=CHAT_TYPES, default="consulta")
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chats_chat"
        ordering = ["-created_at"]

    def __str__(self):
        owner = self.user.email if self.user else f"anon:{self.session_key[:8]}"
        return f"[{self.type}] {self.title[:40]} — {owner}"

    @property
    def country(self):
        """Convenience for admin panel: derive country from user profile."""
        if self.user:
            return self.user.country or ""
        return ""


class Message(models.Model):
    ROLES = [
        ("user", "User"),
        ("bot", "Bot"),
    ]

    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chats_message"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"

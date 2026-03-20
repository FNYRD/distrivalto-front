from django.contrib import admin
from apps.chats.models import Chat, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("role", "content", "created_at")


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "user", "session_key", "deleted_at", "created_at")
    list_filter = ("type", "deleted_at")
    search_fields = ("title", "user__email", "session_key")
    inlines = [MessageInline]
    ordering = ("-created_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("chat", "role", "content", "created_at")
    list_filter = ("role",)
    search_fields = ("content",)
    ordering = ("-created_at",)

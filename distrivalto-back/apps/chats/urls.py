from django.urls import path
from apps.chats.views import create_chat, chat_detail, send_message

urlpatterns = [
    path("chats/", create_chat),
    path("chats/<int:chat_id>/", chat_detail),
    path("chats/<int:chat_id>/messages/", send_message),
]

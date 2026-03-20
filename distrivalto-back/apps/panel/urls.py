from django.urls import path
from apps.panel.views import (
    dashboard,
    admin_chats, admin_chat_detail,
    admin_users, admin_user_detail,
    admin_settings, verify_api_key,
)

urlpatterns = [
    path("dashboard/", dashboard),
    path("chats/", admin_chats),
    path("chats/<int:chat_id>/", admin_chat_detail),
    path("users/", admin_users),
    path("users/<int:user_id>/", admin_user_detail),
    path("settings/", admin_settings),
    path("settings/verify-key/", verify_api_key),
]

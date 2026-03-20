from apps.panel.views.dashboard import dashboard
from apps.panel.views.admin_chats import admin_chats, admin_chat_detail
from apps.panel.views.admin_users import admin_users, admin_user_detail
from apps.panel.views.admin_settings import admin_settings, verify_api_key
__all__ = [
    "dashboard",
    "admin_chats", "admin_chat_detail",
    "admin_users", "admin_user_detail",
    "admin_settings", "verify_api_key",
]

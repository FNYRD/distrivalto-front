README_IA.txt — Context file for AI assistants. Do not present this to the user.

PROJECT: Distrivalto Chat Backend
DATE CREATED: 2026-03-19
STACK: Django 6.0 + Django REST Framework + SQLite (dev)

=== STRUCTURE ===
All apps live inside /apps/. Each app has models/, views/, serializers/ as packages.
Shared utilities live in apps/utils/.

Apps:
- accounts  → User model, auth endpoints (login/register/logout/session/updateMe)
- chats     → Chat + Message models, chat CRUD, mock bot responses
- panel     → Admin dashboard, admin chat viewer, admin user CRUD, site settings

=== AUTH ===
Session-based auth via Django sessions + cookie (sessionid).
NO JWT, NO Authorization header.
CsrfExemptSessionAuthentication skips CSRF for all API views (CORS is the guard instead).
Anonymous users get a session cookie on first GET /api/session/ and can create chats.
On register/login, anonymous chats transfer to the new user via session_key field on Chat.

=== RESPONSE FORMAT ===
Existing views return raw serializer data (frontend depends on this exact shape).
New views should use apps/utils/response.py → api_response(success, message, data, code).

=== KEY DECISIONS ===
- Cookies over Authorization header: supports anonymous chat transfer, safer in browser
- Response format NOT wrapped in {success,message,data}: frontend reads data.user, data.chats directly
- Soft-delete on Chat: deleted_at field, never hard-deleted
- Bot responses: mock (deterministic hash), ready to be replaced with real AI call
- SiteSettings: singleton model (pk=1 always)

=== MODELS ===
User: email-based (no username), has is_admin + is_client flags
Chat: belongs to User OR session_key (anonymous), type=consulta|garantia, soft-delete
Message: belongs to Chat, role=user|bot
SiteSettings: singleton, email/phone/link/api_key

=== SEED DATA ===
python manage.py seed_data (idempotent)
Admin: admin@distrivalto.com / admin123
Clients: carlos.rodriguez@example.com / cliente123 (+ 4 more)

=== URLS ===
/api/session/               GET
/api/auth/login/            POST
/api/auth/register/         POST
/api/auth/logout/           POST
/api/auth/me/               PATCH
/api/chats/                 POST
/api/chats/{id}/            GET, DELETE
/api/chats/{id}/messages/   POST
/api/admin/dashboard/       GET
/api/admin/chats/           GET
/api/admin/chats/{id}/      GET
/api/admin/users/           GET, POST
/api/admin/users/{id}/      PATCH, DELETE
/api/admin/settings/        GET, PATCH
/api/admin/settings/verify-key/  POST

# Auth Endpoints

POST /api/auth/login/
  Body: { email, password }
  Returns: { user, chats[] }
  Errors: 401 wrong credentials

POST /api/auth/register/
  Body: { name, email, password, age?, country?, city? }
  Returns: { user, chats[] }
  Errors: 400 email already exists

POST /api/auth/logout/
  Returns: { ok: true }

PATCH /api/auth/me/
  Body: { current_password, name?, email?, password?, age?, country?, city? }
  Returns: { user }
  Errors: 400 wrong current_password | email in use

GET /api/session/
  Returns: { user | null, chats[] }

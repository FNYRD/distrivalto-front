# Chat Endpoints

POST /api/chats/
  Body: { type: consulta|garantia, message }
  Returns: { id, title, type, createdAt, messages[] }
  Errors: 400 empty message | invalid type

GET /api/chats/{id}/
  Returns: { id, title, type, createdAt, messages[] }
  Errors: 404 not found

DELETE /api/chats/{id}/
  Returns: { ok: true }
  Errors: 404 not found

POST /api/chats/{id}/messages/
  Body: { message }
  Returns: { id, role, content, createdAt }  ← bot reply only
  Errors: 400 empty message | 404 chat not found

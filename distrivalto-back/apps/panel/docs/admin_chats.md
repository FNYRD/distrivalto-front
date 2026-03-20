# Admin Chats

GET /api/admin/chats/?offset=0&limit=10
  Auth: admin required
  Returns: { chats[], total }
  Errors: 403 not admin

GET /api/admin/chats/{id}/
  Auth: admin required
  Returns: { id, title, type, country, createdAt, messages[] }
  Errors: 403 not admin | 404 not found

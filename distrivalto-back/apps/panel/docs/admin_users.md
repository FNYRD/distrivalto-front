# Admin Users

GET /api/admin/users/
  Auth: admin required
  Returns: { admins: [{ id, email }] }

POST /api/admin/users/
  Body: { email, password }
  Returns: { id, email }
  Errors: 400 email exists | missing fields

PATCH /api/admin/users/{id}/
  Body: { email?, password? }
  Returns: { id, email }
  Errors: 400 email in use | 404 not found

DELETE /api/admin/users/{id}/
  Returns: { ok: true }
  Errors: 400 self-deletion | 404 not found

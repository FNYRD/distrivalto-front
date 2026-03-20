# Admin Settings

GET /api/admin/settings/
  Auth: admin required
  Returns: { email, phone, link, apiKey }

PATCH /api/admin/settings/
  Body: { email?, phone?, link?, apiKey? }
  Returns: { ok: true }

POST /api/admin/settings/verify-key/
  Auth: admin required
  Returns: { ok: true }
  Errors: 400 no api key configured

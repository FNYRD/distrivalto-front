from rest_framework.decorators import api_view
from rest_framework import status
from apps.panel.models import SiteSettings
from apps.panel.views._helpers import require_admin
from apps.utils.response import error_response, success_response


@api_view(["GET", "PATCH"])
def admin_settings(request):
    """
    GET   /api/admin/settings/  → { email, phone, link, apiKey }
    PATCH /api/admin/settings/  → { ok: true }
    """
    err = require_admin(request)
    if err:
        return err

    cfg = SiteSettings.load()

    if request.method == "GET":
        return success_response({
            "email": cfg.email,
            "phone": cfg.phone,
            "link": cfg.link,
            "apiKey": cfg.api_key,
        })

    # PATCH — only update sent fields
    if "email" in request.data:
        cfg.email = request.data["email"]
    if "phone" in request.data:
        cfg.phone = request.data["phone"]
    if "link" in request.data:
        cfg.link = request.data["link"]
    if "apiKey" in request.data:
        cfg.api_key = request.data["apiKey"]

    cfg.save()
    return success_response({"ok": True})


@api_view(["POST"])
def verify_api_key(request):
    """
    POST /api/admin/settings/verify-key/
    Verifies the stored API key against the actual provider.
    Detects provider from key prefix:
      - sk-ant-...  → Anthropic
      - sk-...      → OpenAI
    Returns { ok: true } or 400 { error }.
    """
    import json
    import urllib.request
    import urllib.error

    err = require_admin(request)
    if err:
        return err

    cfg = SiteSettings.load()
    if not cfg.api_key:
        return error_response("No hay API key configurada.")

    key = cfg.api_key.strip()

    try:
        if key.startswith("sk-ant-"):
            # Anthropic — minimal messages call
            body = json.dumps({
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 1,
                "messages": [{"role": "user", "content": "hi"}],
            }).encode()
            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=body,
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                method="POST",
            )
        elif key.startswith("sk-"):
            # OpenAI — minimal chat completion
            body = json.dumps({
                "model": "gpt-4o-mini",
                "max_tokens": 1,
                "messages": [{"role": "user", "content": "hi"}],
            }).encode()
            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=body,
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
        else:
            return error_response("Formato de API key no reconocido. Se esperaba una key de Anthropic (sk-ant-...) o OpenAI (sk-...).")

        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
        return success_response({"ok": True})

    except urllib.error.HTTPError as e:
        try:
            detail = json.loads(e.read().decode()).get("error", {})
            msg = detail.get("message") or str(detail)
        except Exception:
            msg = f"HTTP {e.code}"
        return error_response(f"API key inválida: {msg}")
    except Exception as e:
        return error_response(f"No se pudo conectar al proveedor: {str(e)}")

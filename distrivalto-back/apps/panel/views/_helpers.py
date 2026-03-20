from apps.utils.response import error_response


def require_admin(request):
    if not request.user.is_authenticated or not request.user.is_admin:
        return error_response("Acceso denegado.", 403)
    return None

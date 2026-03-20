from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """Skip CSRF check for all API views.

    The frontend sends credentials via cookies (credentials: 'include') but
    does not attach a CSRF token header. This is safe in development because
    CORS is locked to the allowed origin list.
    """

    def enforce_csrf(self, request):
        return  # Do nothing

from rest_framework.decorators import api_view
from apps.panel.views._helpers import require_admin
from apps.panel.mock_data import get_dashboard_data
from apps.utils.response import success_response


@api_view(["GET"])
def dashboard(request):
    """GET /api/admin/dashboard/"""
    err = require_admin(request)
    if err:
        return err
    return success_response(get_dashboard_data())

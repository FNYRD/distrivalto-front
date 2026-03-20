from rest_framework.response import Response
from rest_framework import status as http_status


def error_response(message, code=http_status.HTTP_400_BAD_REQUEST):
    return Response({"error": message}, status=code)


def success_response(data, code=http_status.HTTP_200_OK):
    return Response(data, status=code)

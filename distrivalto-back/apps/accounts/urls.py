from django.urls import path
from apps.accounts.views import session, login, register, logout, update_me

urlpatterns = [
    path("session/", session),
    path("auth/login/", login),
    path("auth/register/", register),
    path("auth/logout/", logout),
    path("auth/me/", update_me),
]

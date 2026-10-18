from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    me,
    RegisterView,
    ReceptionistListView,
    ReceptionistStatusView,
)

app_name = "accounts"

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("auth/me/", me, name="me"),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/receptionists/", ReceptionistListView.as_view(), name="receptionist-list"),
    path("auth/receptionists/<int:pk>/status/", ReceptionistStatusView.as_view(), name="receptionist-status"),
]
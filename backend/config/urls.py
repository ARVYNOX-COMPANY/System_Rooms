from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from .views import health_check

api_v1 = [
    path("health/", health_check, name="health"),
    path("", include("apps.accounts.urls")),     # ← todos los auth acá
    path("", include("apps.rooms.urls")),
    path("", include("apps.frontdesk.urls")),
    path("", include("apps.cashier.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1)),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]
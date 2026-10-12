from rest_framework.routers import DefaultRouter

from .views import HabitacionViewSet #, ReservaViewSet

router = DefaultRouter()
router.register("habitaciones", HabitacionViewSet, basename="habitacion")
# router.register("reservas", ReservaViewSet, basename="reserva")

urlpatterns = router.urls
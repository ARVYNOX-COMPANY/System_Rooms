from django.urls import path

from . import views

urlpatterns = [
    path("caja/abrir/", views.abrir_turno, name="caja-abrir"),
    path("caja/actual/", views.turno_actual, name="caja-actual"),
    path("caja/cerrar/", views.cerrar_turno, name="caja-cerrar"),
]
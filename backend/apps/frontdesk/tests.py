from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from apps.rooms.models import Habitacion
from .models import Huesped, Reserva


class CancelarReservaTest(APITestCase):
    def setUp(self):
        self.hab = Habitacion.objects.create(
            numero="101", tipo="SIMPLE", piso=1, precio_base="50.00"
        )
        self.huesped = Huesped.objects.create(
            nombre_completo="Ana López", documento_identidad="INE123"
        )
        self.hoy = timezone.localdate()

    def crear_reserva(self, estado):
        return Reserva.objects.create(
            huesped=self.huesped,
            habitacion=self.hab,
            fecha_entrada=self.hoy,
            fecha_salida=self.hoy + timedelta(days=2),
            estado=estado,
        )

    def cancelar(self, reserva_id):
        return self.client.post(f"/api/v1/reservas/{reserva_id}/cancelar/")

    def test_cancelar_pendiente(self):
        reserva = self.crear_reserva(Reserva.Estado.PENDIENTE)
        r = self.cancelar(reserva.id)
        self.assertEqual(r.status_code, 200, r.json())
        self.assertEqual(r.json()["estado"], "CANCELADA")
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, "LIBRE")

    def test_cancelar_en_casa_libera_habitacion(self):
        self.hab.estado = "OCUPADA"
        self.hab.save()
        reserva = self.crear_reserva(Reserva.Estado.CHECKIN)
        r = self.cancelar(reserva.id)
        self.assertEqual(r.status_code, 200, r.json())
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, "LIBRE")

    def test_no_cancelar_checkout(self):
        reserva = self.crear_reserva(Reserva.Estado.CHECKOUT)
        r = self.cancelar(reserva.id)
        self.assertEqual(r.status_code, 400)

    def test_no_cancelar_dos_veces(self):
        reserva = self.crear_reserva(Reserva.Estado.PENDIENTE)
        self.cancelar(reserva.id)
        r = self.cancelar(reserva.id)
        self.assertEqual(r.status_code, 400)

    def test_reserva_inexistente(self):
        self.assertEqual(self.cancelar(999).status_code, 404)

    def test_flujo_checkin_y_cancelar(self):
        datos = {
            "habitacion_id": self.hab.id,
            "nombre_completo": "Luis Pérez",
            "documento_identidad": "INE999",
            "fecha_salida": str(self.hoy + timedelta(days=2)),
        }
        r = self.client.post("/api/v1/reservas/checkin/", datos, format="json")
        self.assertEqual(r.status_code, 201, r.json())
        r = self.cancelar(r.json()["id"])
        self.assertEqual(r.json()["estado"], "CANCELADA")
        self.hab.refresh_from_db()
        self.assertEqual(self.hab.estado, "LIBRE")
class ExtenderEstadiaTest(APITestCase):
    def setUp(self):
        self.hab = Habitacion.objects.create(
            numero="102", tipo="SIMPLE", piso=1, precio_base="50.00", estado="OCUPADA"
        )
        self.huesped = Huesped.objects.create(
            nombre_completo="Luis Pérez", documento_identidad="INE456"
        )
        self.hoy = timezone.localdate()
        self.reserva = Reserva.objects.create(
            huesped=self.huesped,
            habitacion=self.hab,
            fecha_entrada=self.hoy,
            fecha_salida=self.hoy + timedelta(days=2),
            estado=Reserva.Estado.CHECKIN,
        )
        self.url = f"/api/v1/reservas/{self.reserva.id}/"

    def patch(self, fecha):
        return self.client.patch(self.url, {"fecha_salida": str(fecha)}, format="json")

    def test_extender(self):
        nueva = self.hoy + timedelta(days=5)
        r = self.patch(nueva)
        self.assertEqual(r.status_code, 200, r.json())
        self.assertEqual(r.json()["fecha_salida"], str(nueva))

    def test_fecha_hoy_rechazada(self):
        self.assertEqual(self.patch(self.hoy).status_code, 400)

    def test_sin_fecha_400(self):
        r = self.client.patch(self.url, {}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_solo_reservas_activas(self):
        self.reserva.estado = Reserva.Estado.CHECKOUT
        self.reserva.save()
        self.assertEqual(self.patch(self.hoy + timedelta(days=5)).status_code, 400)

    def test_no_cambia_otros_campos(self):
        r = self.client.patch(
            self.url,
            {"fecha_salida": str(self.hoy + timedelta(days=3)), "estado": "CHECKOUT"},
            format="json",
        )
        self.assertEqual(r.json()["estado"], "CHECKIN")

    def test_reserva_inexistente(self):
        r = self.client.patch(
            "/api/v1/reservas/999/", {"fecha_salida": str(self.hoy + timedelta(days=3))}, format="json"
        )
        self.assertEqual(r.status_code, 404)
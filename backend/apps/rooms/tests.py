from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.frontdesk.models import Huesped, Reserva
from .models import Habitacion


URL = "/api/v1/habitaciones/"


class HabitacionTest(APITestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(
            username="recepcion", password="test-password"
        )
        self.client.force_authenticate(user)

    def crear(self, numero="101", tipo="SIMPLE", **extra):
        datos = {
            "numero": numero,
            "tipo": tipo,
            "piso": 1,
            "estado": "LIBRE",
            **extra,
        }
        return self.client.post(URL, datos, format="json")

    def ocupar(self, habitacion):
        hoy = timezone.localdate()
        huesped = Huesped.objects.create(
            nombre_completo="Ana", documento_identidad="X1"
        )
        Reserva.objects.create(
            huesped=huesped,
            habitacion=habitacion,
            estado=Reserva.Estado.CHECKIN,
            fecha_entrada=hoy,
            fecha_salida=hoy + timedelta(days=5),
        )
        habitacion.estado = Habitacion.Estado.OCUPADA
        habitacion.save(update_fields=["estado"])

    def test_crear_pone_precio_por_tipo(self):
        response = self.crear(tipo="SUITE", precio_base=1)

        self.assertEqual(response.status_code, 201, response.json())
        self.assertEqual(float(response.json()["habitacion"]["precio_base"]), 150)

    def test_upsert_actualiza_si_existe(self):
        self.crear()

        response = self.crear(tipo="DOBLE")

        self.assertEqual(response.status_code, 200, response.json())
        self.assertTrue(response.json()["updated"])
        self.assertEqual(Habitacion.objects.count(), 1)

    def test_upsert_no_modifica_habitacion_ocupada(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]
        habitacion = Habitacion.objects.get(pk=habitacion_id)
        self.ocupar(habitacion)

        response = self.crear(tipo="SUITE")

        self.assertEqual(response.status_code, 409, response.json())
        habitacion.refresh_from_db()
        self.assertEqual(habitacion.estado, Habitacion.Estado.OCUPADA)
        self.assertEqual(habitacion.tipo, Habitacion.Tipo.SIMPLE)

    def test_no_liberar_a_mano_una_habitacion_ocupada(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]
        habitacion = Habitacion.objects.get(pk=habitacion_id)
        self.ocupar(habitacion)

        response = self.client.patch(
            f"{URL}{habitacion.id}/", {"estado": "LIBRE"}, format="json"
        )

        self.assertEqual(response.status_code, 400, response.json())

    def test_no_ocupar_a_mano(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]

        response = self.client.patch(
            f"{URL}{habitacion_id}/", {"estado": "OCUPADA"}, format="json"
        )

        self.assertEqual(response.status_code, 400, response.json())

    def test_no_crear_habitacion_ocupada_manualmente(self):
        response = self.crear(estado="OCUPADA")

        self.assertEqual(response.status_code, 400, response.json())

    def test_estado_libre_y_sucia_se_puede_cambiar_manualmente(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]

        response = self.client.patch(
            f"{URL}{habitacion_id}/", {"estado": "SUCIA"}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.json())

        response = self.client.patch(
            f"{URL}{habitacion_id}/", {"estado": "LIBRE"}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.json())

    def test_poner_en_mantenimiento_y_filtrar(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]
        otra_id = self.crear(numero="102").json()["habitacion"]["id"]

        response = self.client.patch(
            f"{URL}{habitacion_id}/",
            {"en_mantenimiento": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.json())
        self.assertTrue(response.json()["en_mantenimiento"])

        response = self.client.get(f"{URL}?en_mantenimiento=true")
        self.assertEqual(
            [habitacion["id"] for habitacion in response.json()], [habitacion_id]
        )
        self.assertNotEqual(habitacion_id, otra_id)

    def test_no_poner_en_mantenimiento_ni_ocultar_habitacion_ocupada(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]
        habitacion = Habitacion.objects.get(pk=habitacion_id)
        self.ocupar(habitacion)

        for campo in ("en_mantenimiento", "oculta"):
            with self.subTest(campo=campo):
                response = self.client.patch(
                    f"{URL}{habitacion.id}/", {campo: True}, format="json"
                )
                self.assertEqual(response.status_code, 400, response.json())

    def test_no_ocultar_piso_con_habitacion_ocupada(self):
        habitacion_id = self.crear().json()["habitacion"]["id"]
        habitacion = Habitacion.objects.get(pk=habitacion_id)
        self.ocupar(habitacion)

        response = self.client.post(
            f"{URL}ocultar-piso/", {"piso": 1, "oculta": True}, format="json"
        )

        self.assertEqual(response.status_code, 400, response.json())
        habitacion.refresh_from_db()
        self.assertFalse(habitacion.oculta)

    def test_precios_por_tipo(self):
        response = self.client.get(f"{URL}precios-por-tipo/")

        self.assertEqual(response.json()["SUITE"], 150)

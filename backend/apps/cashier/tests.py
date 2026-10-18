from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

ABRIR = "/api/v1/caja/abrir/"
ACTUAL = "/api/v1/caja/actual/"
CERRAR = "/api/v1/caja/cerrar/"

# Códigos de error tal como están escritos en apps/cashier/services.py.
CODIGO_SIN_TURNO = "TURNO_REQUERIDO"
CODIGO_YA_ABIERTO = "TURNO_YA_ABIERTO"


def D(valor):
    """Compara montos sin importar si llegan como texto ("1000.00") o número (1000.0)."""
    return Decimal(str(valor))


class CajaTest(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("cajero", password="x")
        self.client.force_authenticate(self.user)

    def abrir(self, monto="1000.00"):
        return self.client.post(ABRIR, {"monto_inicial": monto}, format="json")

    def assertError(self, r, code):
        """Error de regla de negocio (400 o 409, según config/exceptions.py)."""
        self.assertIn(r.status_code, (400, 409), r.json())
        self.assertEqual(r.json()["code"], code)

    def test_sin_turno(self):
        self.assertError(self.client.get(ACTUAL), CODIGO_SIN_TURNO)

    def test_abrir(self):
        r = self.abrir()
        self.assertEqual(r.status_code, 201, r.json())
        self.assertEqual(D(r.json()["monto_esperado"]), D("1000.00"))
        self.assertEqual(self.client.get(ACTUAL).status_code, 200)

    def test_no_abrir_dos(self):
        self.abrir()
        self.assertError(self.abrir("500.00"), CODIGO_YA_ABIERTO)

    def test_monto_negativo_400(self):
        self.assertEqual(self.abrir("-10.00").status_code, 400)

    def test_cerrar_con_faltante(self):
        self.abrir()
        r = self.client.post(CERRAR, {"monto_contado": "980.00"}, format="json")
        self.assertEqual(r.status_code, 200, r.json())
        self.assertEqual(r.json()["estado"], "CERRADO")
        self.assertEqual(D(r.json()["diferencia"]), D("-20.00"))

    def test_despues_de_cerrar_se_puede_abrir_otro(self):
        self.abrir()
        self.client.post(CERRAR, {"monto_contado": "1000.00"}, format="json")
        self.assertError(self.client.get(ACTUAL), CODIGO_SIN_TURNO)
        self.assertEqual(self.abrir("0.00").status_code, 201)

    def test_cerrar_sin_turno(self):
        r = self.client.post(CERRAR, {"monto_contado": "100.00"}, format="json")
        self.assertError(r, CODIGO_SIN_TURNO)

    def test_turnos_son_por_usuario(self):
        self.abrir()
        otro = get_user_model().objects.create_user("otro", password="x")
        self.client.force_authenticate(otro)
        self.assertError(self.client.get(ACTUAL), CODIGO_SIN_TURNO)
        self.assertEqual(self.abrir().status_code, 201)  # el otro puede abrir el suyo
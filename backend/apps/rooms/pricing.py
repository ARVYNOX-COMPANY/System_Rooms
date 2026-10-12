"""
Precios oficiales por tipo de habitación.
Fuente única de verdad: si cambia un precio, se cambia acá y se propaga a todo el sistema.
"""

PRECIOS_POR_TIPO = {
    "SIMPLE": 50,
    "DOBLE": 80,
    "SUITE": 150,
}


def precio_para_tipo(tipo: str) -> int:
    """Devuelve el precio base para un tipo. Lanza si el tipo no existe."""
    try:
        return PRECIOS_POR_TIPO[tipo]
    except KeyError:
        raise ValueError(f"Tipo de habitación inválido: {tipo}")
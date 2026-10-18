"""Genera los iconos PNG de la extensión con la biblioteca estándar (sin dependencias).

Dibuja un QR estilizado: tres patrones localizadores y módulos de datos en azul
oscuro sobre fondo blanco, con el módulo inferior derecho en azul de marca.

Uso: python3 tools/make-icons.py
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ICONOS = RAIZ / "icons"
TAMANOS = (16, 32, 48, 128)

MODULOS = 21  # QR de la versión 1
MARGEN_MODULOS = 1
OSCURO = (15, 23, 42, 255)
AZUL = (29, 78, 216, 255)
CLARO = (255, 255, 255, 255)


def es_patron_localizador(fila: int, columna: int) -> bool:
    for base_fila, base_columna in ((0, 0), (0, 14), (14, 0)):
        if base_fila <= fila < base_fila + 7 and base_columna <= columna < base_columna + 7:
            return True
    return False


def valor_modulo(fila: int, columna: int) -> bool:
    """True si el módulo se pinta."""
    if es_patron_localizador(fila, columna):
        rel_fila = fila % 14 if fila < 14 else fila - 14
        rel_columna = columna % 14 if columna < 14 else columna - 14
        borde = rel_fila in (0, 6) or rel_columna in (0, 6)
        nucleo = 2 <= rel_fila <= 4 and 2 <= rel_columna <= 4
        return borde or nucleo
    if fila < 8 and columna < 8 or fila < 8 and columna > 12 or fila > 12 and columna < 8:
        return False  # zona de separación de los patrones
    # Datos: patrón determinista (evita ruido cambiante entre ejecuciones).
    return ((fila * 7 + columna * 3) % 5) in (0, 1, 3)


def color_modulo(fila: int, columna: int) -> tuple[int, int, int, int]:
    if 14 <= fila <= 20 and 14 <= columna <= 20:
        return AZUL  # marca
    return OSCURO


def pixel(fila: int, columna: int, tamano: int) -> tuple[int, int, int, int]:
    util = tamano - 2  # 1 px de margen a cada lado
    if fila < 1 or columna < 1 or fila >= 1 + util or columna >= 1 + util:
        return CLARO
    escala = util / MODULOS
    modulo_fila = min(MODULOS - 1, int((fila - 1) / escala))
    modulo_columna = min(MODULOS - 1, int((columna - 1) / escala))
    if valor_modulo(modulo_fila, modulo_columna):
        return color_modulo(modulo_fila, modulo_columna)
    return CLARO


def escribir_png(ruta: Path, tamano: int) -> None:
    filas = bytearray()
    for fila in range(tamano):
        filas.append(0)  # filtro "None"
        for columna in range(tamano):
            filas.extend(pixel(fila, columna, tamano))

    def bloque(tipo: bytes, datos: bytes) -> bytes:
        return (
            struct.pack(">I", len(datos))
            + tipo
            + datos
            + struct.pack(">I", zlib.crc32(tipo + datos) & 0xFFFFFFFF)
        )

    cabecera = struct.pack(">IIBBBBB", tamano, tamano, 8, 6, 0, 0, 0)  # RGBA, 8 bits
    png = (
        b"\x89PNG\r\n\x1a\n"
        + bloque(b"IHDR", cabecera)
        + bloque(b"IDAT", zlib.compress(bytes(filas), 9))
        + bloque(b"IEND", b"")
    )
    ruta.write_bytes(png)


def main() -> None:
    ICONOS.mkdir(parents=True, exist_ok=True)
    for tamano in TAMANOS:
        destino = ICONOS / ("icon-%d.png" % tamano)
        escribir_png(destino, tamano)
        print("escrito %s (%d bytes)" % (destino.relative_to(RAIZ), destino.stat().st_size))


if __name__ == "__main__":
    main()

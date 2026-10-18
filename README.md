# VeriFactu QR — extensión de navegador

Extensión (Edge, Chrome y Firefox) que genera **la URL y el código QR tributario de VeriFactu** a partir de los datos de la factura, según el **Real Decreto 1007/2023** y la **Orden HAC/1177/2024** (artículos 20 y 21).

Pensada para pymes, asesorías y desarrolladores que están adaptando su facturación a VeriFactu y necesitan comprobar **qué URL exacta debe llevar impreso el QR** antes de tocar código.

- Sin permisos de navegador (`"permissions": []`).
- Sin servidores: todo se calcula en tu equipo, ningún dato sale del navegador.
- Sin telemetría y sin cuentas.

Hecha por **[Plataforma IA](https://plataformaia.com/)**, consultora de automatización con IA para pymes en España (Madrid).

## Qué hace

1. Pide los cuatro datos del registro de facturación: **NIF del emisor**, **número de serie**, **fecha (DD-MM-AAAA)** e **importe total**.
2. Valida el **dígito de control** de NIF, NIE y CIF y el formato de fecha e importe, replicando los **códigos de error de la AEAT 2001–2006**.
3. Construye la URL del servicio de cotejo o remisión con el *URL encoding* exacto que exige la AEAT (el mismo de `java.net.URLEncoder`: `&` → `%26`, espacio → `+`).
4. Dibuja el **QR** que debe imprimirse en la factura y muestra la URL lista para copiar.
5. Ofrece el enlace de consulta con `formato=json` para cotejar el registro contra la AEAT (**ese parámetro nunca debe ir dentro del QR de la factura**).

Selector de las cuatro bases del servicio:

| Entorno | Sistema | Base |
|---|---|---|
| Producción | VERI*FACTU | `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR` |
| Pruebas | VERI*FACTU | `https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR` |
| Producción | No VERI*FACTU | `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQRNoVerifactu` |
| Pruebas | No VERI*FACTU | `https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQRNoVerifactu` |

Ejemplo con el vector oficial de pruebas de la AEAT (`89890001K`, serie `12345678&G33`, `01-01-2024`, `241,40 €`):

```
https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?nif=89890001K&numserie=12345678%26G33&fecha=01-01-2024&importe=241.4
```

## Instalar en modo desarrollo

- **Edge / Chrome:** `edge://extensions` o `chrome://extensions` → activar *Modo de desarrollador* → *Cargar descomprimida* → elegir esta carpeta.
- **Firefox:** `about:debugging#/runtime/this-firefox` → *Cargar un complemento temporal* → elegir `manifest.json`.

## Estructura

```
manifest.json          Manifest V3 (Edge, Chrome y Firefox)
popup.html             Interfaz del popup
styles.css             Estilos
src/verifactu.js       Núcleo puro: URL del QR, validación NIF/NIE/CIF, errores AEAT
src/popup.js           Interfaz: formulario, QR, copiar y cotejar
vendor/qrcode.js       qrcode-generator 1.4.4 (MIT, Kazuhiko Arase)
tools/make-icons.py    Genera los iconos PNG con la biblioteca estándar
tests/                 Pruebas del núcleo y de empaquetado
```

## Pruebas

```bash
npm test          # node --test: vector oficial de la AEAT, encoding, códigos de error, empaquetado
python3 tools/make-icons.py   # regenerar iconos
zip -r -FS verifactu-qr-extension.zip manifest.json popup.html styles.css src vendor icons README.md PRIVACY.md LICENSE
```

## Privacidad

La extensión no pide permisos, no usa red y no almacena nada (ver [PRIVACY.md](PRIVACY.md)).

## Relacionado

- CLI y servidor MCP con la misma especificación: [verifactu-qr](https://github.com/caseroclaw/verifactu-qr) (`pip install verifactu-qr`).
- Guía práctica de fechas y preparación: [VeriFactu 2027 para pymes](https://plataformaia.com/es/blog/verifactu-2027-pymes-fechas-preparacion).
- Automatización de facturación y cobros para pymes: [plataformaia.com](https://plataformaia.com/).

## Licencia

MIT © Plataforma IA. `vendor/qrcode.js` es `qrcode-generator` 1.4.4 de Kazuhiko Arase, también bajo licencia MIT.

---

## English

Browser extension (Edge, Chrome and Firefox) that builds the **VeriFactu tax QR URL** for a Spanish invoice from its four data points (issuer tax ID, invoice serial number, issue date, total amount), following **Royal Decree 1007/2023** and **Order HAC/1177/2024**. It validates Spanish tax IDs (NIF/NIE/CIF), reproduces the AEAT error codes 2001–2006, applies the exact `java.net.URLEncoder` URL-encoding the AEAT requires, and renders the QR to be printed on the invoice. Zero permissions, no network, no data leaves the browser.

Built by [Plataforma IA](https://plataformaia.com/), an AI automation consultancy for SMBs in Madrid, Spain.

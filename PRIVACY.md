# Política de privacidad — VeriFactu QR

**Resumen: la extensión no recoge, transmite ni almacena ningún dato personal.**

## Qué datos trata

Los cuatro datos que escribes en el formulario (NIF del emisor, número de serie, fecha e importe) se procesan **íntegramente en tu navegador** para construir la URL del QR y dibujarlo. No se envían a ningún servidor: la extensión no incluye código de red (`fetch`, `XMLHttpRequest` ni websockets) y no declara permisos de navegador (`"permissions": []`).

## Qué NO hace

- No recoge datos de uso, analítica ni telemetría.
- No lee ni modifica las páginas que visitas (no usa content scripts).
- No guarda el formulario ni ningún historial: al cerrar el popup se pierde todo.
- No comparte datos con terceros, porque no hay datos que compartir.

## Servicios de terceros

El popup incluye enlaces (a `plataformaia.com`, a `github.com` y al servicio de cotejo de la AEAT). Esos enlaces solo se abren si haces clic: en ese momento el navegador carga la web de destino y se aplican las políticas de privacidad de ese sitio.

## Cambios

Cualquier cambio futuro en el tratamiento de datos se publicará en este mismo fichero del repositorio.

## Contacto

Plataforma IA — ayuda@plataformaia.com — https://plataformaia.com/

---

## English

**Summary: this extension collects, transmits and stores no personal data.** The four values you type are processed locally in your browser to build the QR URL and draw the QR code. There is no network code, no content scripts, no analytics and no storage, and the extension requests no browser permissions. The only external requests happen when you click one of the links shown in the popup. Contact: ayuda@plataformaia.com.

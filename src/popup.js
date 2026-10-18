/**
 * Interfaz de la extensión: lee el formulario, construye la URL del QR y lo dibuja.
 * Sin permisos de navegador, sin red, sin almacenamiento.
 */
import { buildQrUrl, formatearImporte, tipoNif, urlConsultaJson, QRError } from './verifactu.js';

const $ = (id) => document.getElementById(id);
const form = $('form');

function leerCampos() {
  return {
    nif: $('nif').value,
    numserie: $('numserie').value,
    fecha: $('fecha').value,
    importe: $('importe').value,
    entorno: $('entorno').value,
    verifactu: $('verifactu').value === 'true',
  };
}

function pintarErrores(mensajes) {
  const caja = $('errores');
  const lista = $('lista-errores');
  lista.textContent = '';
  if (!mensajes.length) {
    caja.hidden = true;
    return;
  }
  for (const m of mensajes) {
    const li = document.createElement('li');
    li.textContent = m;
    lista.appendChild(li);
  }
  caja.hidden = false;
}

function pintarQr(url) {
  const contenedor = $('qr');
  contenedor.textContent = '';
  const img = document.createElement('img');
  img.width = 148;
  img.height = 148;
  img.alt = 'Código QR tributario de la factura';
  try {
    const qr = qrcode(0, 'M'); // versión automática, corrección M
    qr.addData(url);
    qr.make();
    img.src = qr.createDataURL(4, 8);
  } catch (e) {
    img.remove();
    contenedor.textContent = 'No se ha podido dibujar el QR: ' + e.message;
    return;
  }
  contenedor.appendChild(img);
}

function generar(mostrarTodo = true) {
  const campos = leerCampos();
  const errores = [];
  try {
    const tipo = tipoNif(campos.nif);
    if (!tipo) errores.push('[2001] El NIF tiene un formato erróneo o no es válido: ' + JSON.stringify(campos.nif.trim()));
  } catch (e) { /* tipoNif no lanza */ }
  try {
    formatearImporte(campos.importe);
  } catch (e) {
    if (e instanceof QRError) errores.push(e.message);
  }

  let url = null;
  try {
    url = buildQrUrl(campos.nif, campos.numserie, campos.fecha, campos.importe, {
      verifactu: campos.verifactu,
      entorno: campos.entorno,
    });
  } catch (e) {
    if (e instanceof QRError && !errores.includes(e.message)) errores.push(e.message);
    else errores.push(e.message);
  }

  pintarErrores(errores);
  if (!url) {
    $('salida').hidden = true;
    return;
  }
  $('salida').hidden = false;
  $('url').value = url;
  $('abrir').href = urlConsultaJson(url);
  $('pista').textContent =
    'NIF ' + tipoNif(campos.nif) + ' · importe normalizado ' + formatearImporte(campos.importe) + ' € · ' +
    (campos.verifactu ? 'VERI*FACTU' : 'No VERI*FACTU') + ' · ' + campos.entorno;
  pintarQr(url);
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  generar();
});

for (const id of ['nif', 'numserie', 'fecha', 'importe', 'entorno', 'verifactu']) {
  $(id).addEventListener('input', () => generar());
  $(id).addEventListener('change', () => generar());
}

$('ejemplo').addEventListener('click', () => {
  $('nif').value = '89890001K';
  $('numserie').value = '12345678&G33';
  $('fecha').value = '01-01-2024';
  $('importe').value = '241,40';
  $('entorno').value = 'produccion';
  $('verifactu').value = 'true';
  generar();
});

$('limpiar').addEventListener('click', () => {
  for (const id of ['nif', 'numserie', 'fecha', 'importe']) $(id).value = '';
  $('salida').hidden = true;
  pintarErrores([]);
});

$('copiar').addEventListener('click', async () => {
  const boton = $('copiar');
  try {
    await navigator.clipboard.writeText($('url').value);
    boton.textContent = 'Copiada';
  } catch (e) {
    $('url').select();
    boton.textContent = 'Selecciónala y copia';
  }
  setTimeout(() => { boton.textContent = 'Copiar URL'; }, 2000);
});

generar();

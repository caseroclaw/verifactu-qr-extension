/**
 * Comprobaciones de empaquetado: todo lo que referencia el manifest existe y los
 * iconos son PNG reales. Evita rechazos tontos en la revisión de Edge/AMO.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(raiz, 'manifest.json'), 'utf8'));

test('manifest version 3 con permisos vacíos', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, []);
  assert.equal(manifest.action.default_popup, 'popup.html');
  assert.match(manifest.homepage_url, /^https:\/\/plataformaia\.com\/?$/);
  assert.ok(manifest.browser_specific_settings.gecko.id.includes('@'));
});

test('todos los ficheros referenciados existen', () => {
  const referencias = [manifest.action.default_popup, ...Object.values(manifest.icons)];
  for (const ruta of referencias) {
    assert.ok(existsSync(join(raiz, ruta)), 'falta ' + ruta);
  }
  for (const ruta of ['src/popup.js', 'src/verifactu.js', 'vendor/qrcode.js', 'styles.css', 'README.md', 'PRIVACY.md', 'LICENSE']) {
    assert.ok(existsSync(join(raiz, ruta)), 'falta ' + ruta);
  }
});

test('los iconos son PNG con las dimensiones anunciadas', () => {
  for (const [tamano, ruta] of Object.entries(manifest.icons)) {
    const datos = readFileSync(join(raiz, ruta));
    assert.equal(datos.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', ruta + ' no es PNG');
    assert.equal(datos.readUInt32BE(16), Number(tamano), ruta + ' tiene ancho ' + datos.readUInt32BE(16));
    assert.equal(datos.readUInt32BE(20), Number(tamano), ruta + ' tiene alto ' + datos.readUInt32BE(20));
  }
});

test('la interfaz carga el generador de QR vendorizado y el módulo propio', () => {
  const html = readFileSync(join(raiz, 'popup.html'), 'utf8');
  assert.ok(html.includes('vendor/qrcode.js'));
  assert.ok(html.includes('src/popup.js'));
  assert.ok(html.includes('https://plataformaia.com/'));
  assert.equal(/<script[^>]+src="https?:/.test(html), false, 'no se permiten scripts remotos (política de AMO)');
});

test('no hay código remoto ni red en el núcleo', () => {
  const nucleo = readFileSync(join(raiz, 'src/verifactu.js'), 'utf8');
  assert.equal(/fetch\(|XMLHttpRequest|eval\(/.test(nucleo), false);
});

/** Comprueba que manifest.json es JSON válido y declara Manifest V3. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(raiz, 'manifest.json'), 'utf8'));

if (manifest.manifest_version !== 3) {
  console.error('manifest_version debe ser 3');
  process.exit(1);
}
if (!manifest.name || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  console.error('name o version inválidos');
  process.exit(1);
}
console.log('manifest OK:', manifest.name, manifest.version);

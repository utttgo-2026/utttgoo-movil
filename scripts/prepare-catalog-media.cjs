/* Offline runtime assets. Run manually: node scripts/prepare-catalog-media.cjs
 * Uses jimp-compact already supplied by Expo; does not install dependencies.
 * Only these explicitly selected sources are downloaded. Originals stay untouched.
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const Jimp = require('jimp-compact');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'src/assets/images/foods');
const figma = path.resolve(root, '../UTTT-Go');
const license = 'https://www.pexels.com/license/';
const selected = [
  ['food-1', '37074229', 'Iván Hernández-Cuevas'],
  ['food-2', '376464', 'Ash Craig'],
  ['food-3', '31823016', 'Allan González'],
  ['food-4', '4725753', 'Polina Tankilevitch'],
  ['food-5c', '27603300', 'Snappr'],
  ['food-8', '5946635', 'Charlotte May'],
  ['food-8b', '17429050', 'Jonathan Reynaga'],
  ['food-8c', '18142614', 'Denys Gromov'],
];
const crops = [
  ['food-5', 'UI-013 Detalle alimento.png', [16, 100, 358, 230]],
  ['food-5b', 'UI-037 Editar alimento.png', [16, 100, 358, 150]],
  ['welcome-artwork', 'UI-002 · Bienvenida.png', [16, 56, 358, 280]],
  ['tortas-banner', 'UI-012 Categoría.png', [16, 100, 358, 120]],
];

async function save(image, name, maxEdge) {
  const result = image.clone();
  const { width, height } = result.bitmap;
  const factor = Math.min(1, maxEdge / Math.max(width, height));
  if (factor < 1) result.resize(Math.round(width * factor), Math.round(height * factor));
  const bytes = await result.quality(82).getBufferAsync(Jimp.MIME_JPEG);
  const file = `${name}.jpg`;
  await fs.writeFile(path.join(output, file), bytes);
  return { file, width: result.bitmap.width, height: result.bitmap.height, bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
}

async function main() {
  await fs.access(path.join(root, 'src/assets/images'));
  await fs.access(path.join(root, 'specs/006-figma-ui-navigation-fixes'));
  await fs.mkdir(output, { recursive: true });
  const assets = [];
  for (const [id, photo, author] of selected) {
    const url = `https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?w=960`;
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`Image download failed: ${id}, HTTP ${response.status}`);
    }
    const image = await Jimp.read(Buffer.from(await response.arrayBuffer()));
    const detail = await save(image, `${id}-detail`, 960);
    const thumbnail = await save(image, `${id}-thumb`, 420);
    assets.push({ id, source: `https://www.pexels.com/photo/${photo}/`, download: url, author, license,
      kind: 'licensed-alternative', transformation: 'JPEG quality82; proportional resize; no upscaling', thumbnail, detail });
    console.log(`${id}: ${thumbnail.bytes + detail.bytes} bytes`);
  }
  for (const [id, file, crop] of crops) {
    const original = await fs.readFile(path.join(figma, file));
    const image = (await Jimp.read(original)).crop(...crop);
    const detail = await save(image, `${id}-detail`, 960);
    const thumbnail = id.startsWith('food-') ? await save(image, `${id}-thumb`, 420) : undefined;
    assets.push({ id, source: `../UTTT-Go/${file}`, author: null, license: null,
      kind: 'temporary-figma-crop', crop, originalSha256: crypto.createHash('sha256').update(original).digest('hex'),
      transformation: 'Temporary screenshot crop [x,y,width,height]; JPEG quality82; no upscaling', thumbnail, detail });
    console.log(`${id}: ${detail.width}x${detail.height}, temporary crop`);
  }
  await fs.writeFile(path.join(root, 'specs/006-figma-ui-navigation-fixes/media-assets.generated.json'),
    `${JSON.stringify({ preparedOn: '2026-11-12', assets }, null, 2)}\n`);
  console.log(`Total: ${assets.reduce((sum, asset) => sum + asset.detail.bytes + (asset.thumbnail?.bytes ?? 0), 0)} bytes`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

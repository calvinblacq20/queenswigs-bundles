// Generates responsive WebP images from assets-src/ into public/img/.
// Run with `npm run images` whenever a source image is added or replaced.
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src');
const OUT = path.join(ROOT, 'public', 'img');

// Editorial photos keep their aspect ratio; name is the public file stem.
const STOCK = {
  'photo-1645736279976-59f8fd22720c': 'hero-waves',
  'photo-1709810529099-0ce6102692df': 'hero-afro',
  'photo-1672243176920-c0bda4b6909c': 'hero-bob',
  'photo-1648827966041-f773128fc993': 'style-bob',
  'photo-1785273925791-d65884993689': 'style-pixie',
  'photo-1632765866070-3fadf25d3d5b': 'style-afro',
  'photo-1508002366005-75a695ee2d17': 'style-curls',
  'photo-1692216203899-064d122f0655': 'style-straight',
  'photo-1709912453702-8aa5b9a42640': 'style-bounce',
  'photo-1656473031961-9d5d9ee19f40': 'style-pixie-curls',
  'photo-1669040084821-097235fe53ff': 'edit-occasion',
  'photo-1713845784497-fe3d7ed176d8': 'edit-afro-gold',
  'photo-1598363576971-69666ab1130a': 'edit-noir',
  'photo-1632765854612-9b02b6ec2b15': 'edit-afro',
  'photo-1519699047748-de8e457a634e': 'edit-blush',
  'photo-1702236242829-a34c39814f31': 'edit-salon',
};

const BRAND = {
  'p1.jpg': 'studio-ombre-bob',
  'p2.jpg': 'studio-bundles',
  'PSB_3081.png': 'studio-burgundy-bob',
  'opens.jpg': 'grand-opening-flyer',
};

// TikTok frames that are used full-height (9:16) as well as cropped.
const TALL = new Set([
  '7689513502972677384',
  '7689512664577445172',
  '7689511116820565249',
  '7689506995526733074',
  '7689509539921759495',
  '7689510313137294610',
  '7686097804342627591',
  '7683557914325404946',
  '7684143430053694728',
  '7680334740309822728',
  '7678381959915097362',
  '7688665591825042696',
  '7684364180232752402',
  '7684000712950304007',
  '7677534181202660626',
  '7687392970164817170',
  '7676802069440843026',
  '7681272044100701448',
  '7672546885579590920',
]);

async function isFresh(src, out) {
  try {
    return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs;
  } catch {
    return false;
  }
}

async function emit(src, stem, widths, { aspect, quality = 72, position = 'centre' } = {}) {
  for (const w of widths) {
    const out = path.join(OUT, `${stem}-${w}.webp`);
    if (await isFresh(src, out)) continue;
    let img = sharp(src).rotate();
    img = aspect
      ? img.resize(w, Math.round(w / aspect), { fit: 'cover', position })
      : img.resize({ width: w, withoutEnlargement: true });
    await img.webp({ quality, effort: 5 }).toFile(out);
  }
}

async function main() {
  await mkdir(path.join(OUT, 'p'), { recursive: true });
  await mkdir(path.join(OUT, 'tall'), { recursive: true });
  await mkdir(path.join(ROOT, 'public', 'brand'), { recursive: true });
  let count = 0;

  for (const [file, stem] of Object.entries(STOCK)) {
    await emit(path.join(SRC, 'stock', `${file}.jpg`), stem, [480, 800, 1200, 1600]);
    count++;
  }
  // Landscape crop of the salon photo for the full-bleed services band.
  await emit(
    path.join(SRC, 'stock', 'photo-1702236242829-a34c39814f31.jpg'),
    'edit-salon-wide',
    [800, 1400, 2200],
    {
      aspect: 16 / 9,
    },
  );

  for (const [file, stem] of Object.entries(BRAND)) {
    await emit(path.join(SRC, 'brand', file), stem, [480, 800, 1200]);
    count++;
  }

  for (const file of await readdir(path.join(SRC, 'tiktok'))) {
    const id = path.parse(file).name;
    const src = path.join(SRC, 'tiktok', file);
    await emit(src, `p/${id}`, [360, 600], { aspect: 3 / 4 });
    if (TALL.has(id)) await emit(src, `tall/${id}`, [360, 720], { aspect: 9 / 16 });
    count++;
  }

  // Logos (transparent PNG, trimmed) + favicons from the crowned Q monogram.
  const logos = { 'QUEENS-LOGO-01.png': 'logo-black', 'QUEENS-LOGO-1-02.png': 'logo-gold' };
  for (const [file, stem] of Object.entries(logos)) {
    const src = path.join(SRC, 'brand', file);
    await sharp(src)
      .trim()
      .webp({ quality: 90, alphaQuality: 100 })
      .toFile(path.join(ROOT, 'public', 'brand', `${stem}.webp`));
    await sharp(src)
      .trim()
      .png()
      .toFile(path.join(ROOT, 'public', 'brand', `${stem}.png`));
  }
  const markRaw = await sharp(path.join(SRC, 'brand', 'QUEENS-LOGO-01.png'))
    .extract({ left: 0, top: 0, width: 205, height: 300 })
    .png()
    .toBuffer();
  const markBuf = await sharp(markRaw).trim().png().toBuffer();
  for (const [size, name] of [
    [32, 'favicon-32.png'],
    [180, 'apple-touch-icon.png'],
    [192, 'icon-192.png'],
    [512, 'icon-512.png'],
  ]) {
    const pad = Math.round(size * 0.12);
    await sharp(markBuf)
      .resize(size - pad * 2, size - pad * 2, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(path.join(ROOT, 'public', name));
  }

  // Social share card (1200×630): black field, gold logo, hero portrait.
  const heroCrop = await sharp(path.join(SRC, 'stock', 'photo-1645736279976-59f8fd22720c.jpg'))
    .resize(480, 630, { fit: 'cover', position: 'north' })
    .toBuffer();
  const goldLogo = await sharp(path.join(SRC, 'brand', 'QUEENS-LOGO-1-02.png'))
    .trim()
    .resize(560)
    .toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0b0a09' } })
    .composite([
      { input: heroCrop, left: 720, top: 0 },
      { input: goldLogo, left: 80, top: 230 },
    ])
    .jpeg({ quality: 82 })
    .toFile(path.join(ROOT, 'public', 'og-image.jpg'));

  console.log(`images: processed ${count} sources`);
}

main().catch((err) => {
  console.error('image build failed:', err);
  process.exit(1);
});

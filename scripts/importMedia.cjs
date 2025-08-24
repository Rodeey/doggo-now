'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execFileSync } = require('child_process');

function parseArgs() {
  const args = {};
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--imagesZip') args.imagesZip = a[++i];
    else if (a[i] === '--imagesDir') args.imagesDir = a[++i];
    else if (a[i] === '--venue') args.venue = a[++i];
  }
  return args;
}

async function ensureDir(p) { await fsp.mkdir(p, { recursive: true }); }

function unzip(zipPath, outDir) {
  execFileSync('unzip', ['-o', zipPath, '-d', outDir], { stdio: 
'inherit' });
}

async function collectImagesFromDir(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const ents = await fsp.readdir(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (/\.(jpe?g|png|webp)$/i.test(p)) out.push(p);
    }
  }
  return out;
}

async function optimizeAndCopyImages(srcFiles, destDir) {
  const sharp = require('sharp');
  await ensureDir(destDir);
  srcFiles.sort((a, b) => a.localeCompare(b));

  let hero = null;
  const gallery = [];

  for (const src of srcFiles) {
    const base = path.parse(src).name;
    const stem = base.replace(/\s+/g, '_').toLowerCase();

    for (const width of [1200, 800]) {
      const outJpg = path.join(destDir, `${stem}_${width}.jpg`);
      const outWebp = path.join(destDir, `${stem}_${width}.webp`);
      const pipeline = sharp(src).rotate().resize({ width, 
withoutEnlargement: true });
      await pipeline.jpeg({ quality: 82, progressive: true 
}).toFile(outJpg);
      await pipeline.webp({ quality: 80 }).toFile(outWebp);
    }

    if (!hero) hero = `/${path.posix.join('media', 
path.basename(destDir), `${stem}_1200.jpg`)}`;
    gallery.push(`/${path.posix.join('media', path.basename(destDir), 
`${stem}_800.jpg`)}`);
  }

  return { hero, gallery };
}

(async () => {
  const args = parseArgs();
  if (!args.venue) { console.error('Missing --venue'); process.exit(1); 
}

  const ROOT = process.cwd();
  const PUBLIC_DIR = path.join(ROOT, 'public', 'media');
  const DATA_FILE = path.join(ROOT, 'data', 'venues_media.json');
  const destDir = path.join(PUBLIC_DIR, args.venue);

  await ensureDir(PUBLIC_DIR);
  await ensureDir(destDir);

  let imagePaths = [];
  if (args.imagesZip) {
    const tmp = path.join(ROOT, '.tmp_import_images', args.venue);
    await ensureDir(tmp);
    unzip(args.imagesZip, tmp);
    imagePaths = await collectImagesFromDir(tmp);
  } else if (args.imagesDir) {
    imagePaths = await 
collectImagesFromDir(path.resolve(args.imagesDir));
  } else {
    console.error('Need --imagesZip <zip> or --imagesDir <folder>');
    process.exit(1);
  }
  if (imagePaths.length === 0) { console.error('No images found'); 
process.exit(1); }

  const { hero, gallery } = await optimizeAndCopyImages(imagePaths, 
destDir);

  await ensureDir(path.dirname(DATA_FILE));
  let db = {};
  if (fs.existsSync(DATA_FILE)) {
    try { db = JSON.parse(await fsp.readFile(DATA_FILE, 'utf-8')); } 
catch {}
  }
  db[args.venue] ??= {};
  db[args.venue].hero_image_url = hero;
  db[args.venue].gallery_urls = gallery;
  db[args.venue].media_last_updated = new Date().toISOString();
  await fsp.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');

  console.log('✅ Images imported', { venue: args.venue, hero, 
gallery_count: gallery.length });
})().catch(e => { console.error(e); process.exit(1); });


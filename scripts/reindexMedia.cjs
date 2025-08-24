'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

function stripSizeSuffix(nameNoExt) {
  // remove a trailing _1200 or _800 if present
  return nameNoExt.replace(/_(1200|800)$/i, '');
}

function pickHero(files) {
  // prefer *_1200.jpg, then *_1200.webp, then any *_1200.*, else first file
  const jpg1200 = files.find(f => /_1200\.jpe?g$/i.test(f));
  if (jpg1200) return jpg1200;
  const webp1200 = files.find(f => /_1200\.webp$/i.test(f));
  if (webp1200) return webp1200;
  const any1200 = files.find(f => /_1200\./i.test(f));
  return any1200 || files[0];
}

function pickThumb(files) {
  // prefer *_800.jpg, then *_800.webp, else first file
  const jpg800 = files.find(f => /_800\.jpe?g$/i.test(f));
  if (jpg800) return jpg800;
  const webp800 = files.find(f => /_800\.webp$/i.test(f));
  if (webp800) return webp800;
  return files[0];
}

(async () => {
  const ROOT = process.cwd();
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node scripts/reindexMedia.cjs <venue-slug>');
    process.exit(1);
  }

  const dir = path.join(ROOT, 'public', 'media', slug);
  const DATA_FILE = path.join(ROOT, 'data', 'venues_media.json');

  // read files in the media dir
  const files = await fsp.readdir(dir);
  const images = files.filter(f => /\.(jpe?g|webp)$/i.test(f));

  if (images.length === 0) {
    console.error('No images found in', dir);
    process.exit(1);
  }

  // group by base stem (filename without extension and trailing _1200/_800)
  const groups = new Map();
  for (const f of images) {
    const noExt = f.replace(/\.(jpe?g|webp)$/i, '');
    const stem = stripSizeSuffix(noExt);
    if (!groups.has(stem)) groups.set(stem, []);
    groups.get(stem).push(f);
  }

  // keep deterministic order by stem
  const stems = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b));

  // hero from the first stem group
  const heroFile = pickHero(groups.get(stems[0]));
  const heroUrl = `/${path.posix.join('media', slug, heroFile)}`;

  // gallery: one thumbnail per stem
  const galleryUrls = stems.map(stem => {
    const filesOfOne = groups.get(stem).sort();
    const thumb = pickThumb(filesOfOne);
    return `/${path.posix.join('media', slug, thumb)}`;
  });

  // merge into venues_media.json
  await fsp.mkdir(path.dirname(DATA_FILE), { recursive: true });
  let db = {};
  if (fs.existsSync(DATA_FILE)) {
    try { db = JSON.parse(await fsp.readFile(DATA_FILE, 'utf-8')); } catch {}
  }
  db[slug] = {
    hero_image_url: heroUrl,
    gallery_urls: galleryUrls,
    media_last_updated: new Date().toISOString()
  };
  await fsp.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');

  console.log('✅ Reindexed', { slug, hero: heroUrl, gallery_count: galleryUrls.length });
})().catch(err => { console.error(err); process.exit(1); });

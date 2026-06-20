import sharp from 'sharp';
import { readdirSync, mkdirSync, rmSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const SRC = 'D:/WORK/САЙТ/foto/для сайта';
const ROOT = 'D:/WORK/Claude Code/duzelkhanov-site';
const OUT = path.join(ROOT, 'assets/photos');
const THUMB = path.join(OUT, 'thumb');
const COVER = 'archive-cover.jpg'; // обложка свёрнутого архива — НЕ пересоздаётся, сохраняется как есть

// 1) сохранить обложку (и её миниатюру) перед очисткой папки
const bakCover = path.join(ROOT, '_cover.bak.jpg');
const bakThumb = path.join(ROOT, '_cover.thumb.bak.jpg');
const hasCover = existsSync(path.join(OUT, COVER));
const hasThumb = existsSync(path.join(THUMB, COVER));
if (hasCover) copyFileSync(path.join(OUT, COVER), bakCover);
if (hasThumb) copyFileSync(path.join(THUMB, COVER), bakThumb);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(THUMB, { recursive: true });

// восстановить обложку
if (hasCover) { copyFileSync(bakCover, path.join(OUT, COVER)); rmSync(bakCover, { force: true }); }
if (hasThumb) { copyFileSync(bakThumb, path.join(THUMB, COVER)); rmSync(bakThumb, { force: true }); }

const files = readdirSync(SRC).filter(f => /\.(jpe?g|png|tiff?|heic)$/i.test(f));
// порядок строго по ручной нумерации имён файлов (0,1,2,…), а не по цветности
files.sort((a, b) => {
  const na = parseInt(path.basename(a), 10), nb = parseInt(path.basename(b), 10);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return a.localeCompare(b, undefined, { numeric: true });
});

const photos = [];
// обложка идёт первой в ленте (она же кликабельна в раскрытой сетке)
if (existsSync(path.join(OUT, COVER))) {
  const m = await sharp(path.join(OUT, COVER)).metadata();
  photos.push({ img: `assets/photos/${COVER}`, ar: +(m.width / m.height).toFixed(3) });
}

let i = 0;
for (const f of files) {
  i++;
  const out = `photo-${String(i).padStart(3, '0')}.jpg`;
  try {
    const buf = await sharp(path.join(SRC, f), { limitInputPixels: false }).rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 84, progressive: true, mozjpeg: true }).toBuffer();
    writeFileSync(path.join(OUT, out), buf);
    const m = await sharp(buf).metadata();
    await sharp(buf).resize({ width: 700, withoutEnlargement: true })
      .jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(path.join(THUMB, out));
    photos.push({ img: `assets/photos/${out}`, ar: +(m.width / m.height).toFixed(3) });
  } catch (e) { console.log('ERR', f, e.message); i--; }
}

writeFileSync(path.join(ROOT, 'photos-data.js'), 'const PHOTOS=' + JSON.stringify(photos) + ';\n', 'utf8');
console.log(`Фото из папки: ${i}. Обложка: ${existsSync(path.join(OUT, COVER)) ? 'да' : 'нет'}. Всего в PHOTOS: ${photos.length}`);

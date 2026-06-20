import sharp from 'sharp';
import { readdirSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SRC = 'D:/WORK/САЙТ/foto/для сайта';
const OUT = 'D:/WORK/Claude Code/duzelkhanov-site/assets/photos';
const THUMB = path.join(OUT, 'thumb');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(THUMB, { recursive: true });

const files = readdirSync(SRC).filter(f => /\.(jpe?g|png|tiff?|heic)$/i.test(f));

// классификация ч/б vs цвет
const items = [];
for (const f of files) {
  try {
    const { data } = await sharp(path.join(SRC, f), { limitInputPixels: false })
      .rotate().resize(64, 64, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let sum = 0; const n = data.length / 3;
    for (let i = 0; i < data.length; i += 3) sum += Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]);
    items.push({ f, chroma: sum / n });
  } catch (e) { items.push({ f, chroma: 999, err: e.message }); }
}
// порядок: ч/б (низкая цветность) сначала, затем цветные
items.sort((a, b) => a.chroma - b.chroma);

const photos = [];
let i = 0;
for (const it of items) {
  i++;
  const out = `photo-${String(i).padStart(3, '0')}.jpg`;
  try {
    const buf = await sharp(path.join(SRC, it.f), { limitInputPixels: false }).rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 84, progressive: true, mozjpeg: true }).toBuffer();
    writeFileSync(path.join(OUT, out), buf);
    const m = await sharp(buf).metadata();
    await sharp(buf).resize({ width: 700, withoutEnlargement: true })
      .jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(path.join(THUMB, out));
    photos.push({ img: `assets/photos/${out}`, ar: +(m.width / m.height).toFixed(3) });
  } catch (e) { console.log('ERR', it.f, e.message); i--; }
}

writeFileSync('D:/WORK/Claude Code/duzelkhanov-site/photos-data.js', 'const PHOTOS=' + JSON.stringify(photos) + ';\n', 'utf8');
console.log(`Обработано фото: ${photos.length}. Записано в photos-data.js`);

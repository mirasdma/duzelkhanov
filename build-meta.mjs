import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const OUT = 'D:/WORK/Claude Code/duzelkhanov-site/assets/meta';

/* ── FAVICON (монограмма «Д» — золото на тёмном) ── */
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="13" fill="#100E0B"/>
  <text x="32" y="46" font-family="Georgia,'Times New Roman',serif" font-size="42" font-weight="700" fill="#C9A24B" text-anchor="middle">Д</text>
</svg>`;
writeFileSync(path.join(OUT, 'favicon.svg'), faviconSvg, 'utf8');

const rasterSvg = Buffer.from(faviconSvg);
for (const size of [32, 180, 192, 512]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`;
  await sharp(rasterSvg, { density: 384 }).resize(size, size).png().toFile(path.join(OUT, name));
}

/* ── OG-ПРЕВЬЮ (1200×630) — «Охота» + затемнение + имя ── */
const hero = 'D:/WORK/Claude Code/duzelkhanov-site/assets/works/hero-hunt.jpg';
const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.32" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="470" font-family="Arial,sans-serif" font-size="19" letter-spacing="4" font-weight="700" fill="#E6D6AC">КЕСКІНДЕМЕШІ · ГРАФИК · ИЛЛЮСТРАТОР</text>
  <text x="76" y="544" font-family="Georgia,'Times New Roman',serif" font-size="76" font-weight="700" fill="#ffffff">Ағымсалы Дүзелханов</text>
  <text x="80" y="590" font-family="Arial,sans-serif" font-size="22" letter-spacing="8" fill="#ffffff" fill-opacity="0.92">1951 — 2025</text>
</svg>`);

await sharp(hero, { limitInputPixels: false })
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 86, progressive: true, mozjpeg: true })
  .toFile(path.join(OUT, 'og-cover.jpg'));

console.log('meta assets built: favicon.svg, favicon-32/192/512.png, apple-touch-icon.png, og-cover.jpg');

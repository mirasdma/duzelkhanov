import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync, rmSync, writeFileSync } from 'fs';
import path from 'path';

const SRC = 'D:/WORK/САЙТ';
const OUT = 'D:/WORK/Claude Code/duzelkhanov-site/assets/works';
const THUMB = path.join(OUT, 'thumb');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(THUMB, { recursive: true });

const groups = [
  { dir: 'Масляные работы/для сайта',              tech: 'oil' },
  { dir: 'Графика акварель/для сайта',             tech: 'water' },
  { dir: 'Графика карандаш литография/для сайта',  tech: 'pencil' },
  { dir: 'наброски/для сайта',                     tech: 'sketch' },
  { dir: 'Иллюстрации к детским книгам/для сайта',  tech: 'kids' },
];

// материал работы (вторая строка под названием)
const DLAB = {
  oil:    { ru: 'Холст, масло',       kz: 'Кенеп, май бояу',  en: 'Oil on canvas' },
  water:  { ru: 'Бумага, акварель',   kz: 'Қағаз, акварель',  en: 'Watercolour on paper' },
  pencil: { ru: 'Бумага, карандаш',   kz: 'Қағаз, қарындаш',  en: 'Pencil on paper' },
  sketch: { ru: 'Бумага, карандаш',   kz: 'Қағаз, қарындаш',  en: 'Pencil on paper' },
  kids:   { ru: 'Книжная иллюстрация',kz: 'Кітап суреті',     en: 'Book illustration' },
};

// общие подписи для категорий без индивидуальных названий
const NUMBERED = {
  sketch: { ru: 'Зарисовки и эскизы',                kz: 'Нобайлар мен эскиздер',                  en: 'Sketches and studies' },
  kids:   { ru: 'Из серии работ к детским книгам',   kz: 'Балалар кітаптарына арналған сериядан',  en: "From the children's book series" },
};

// Таблица: [префикс имени файла, ru, kz, en, цикл]
// сопоставление по самому длинному совпавшему префиксу (регистр игнорируется)
const R='rulers', LY='lyric', LA='landscape', IL='illustr';
const MAP = [
  // ── МАСЛО ─────────────────────────────────────────────
  ['Амазонка',               'Амазонка',                 'Амазонка',                 'The Amazon', R],
  ['Проводы',                'Проводы',                  'Шығарып салу',             'The Farewell', LY],
  ['Ablai khan(Bukhar',      'Абылай хан и Бухар жырау', 'Абылай хан мен Бұқар жырау','Ablai Khan and Bukhar Zhyrau', R],
  ['Абылай хан (портрет)',   'Абылай хан',               'Абылай хан',               'Ablai Khan', R],
  ['Абылхаир хан',           'Абулхаир хан',             'Әбілқайыр хан',            'Abulkhair Khan', R],
  ['Адыраспан',              'Адыраспан',                'Адыраспан',                'Adyraspan', LY],
  ['Алпамыс-батыр',          'Алпамыс батыр',            'Алпамыс батыр',            'Alpamys Batyr', IL],
  ['Весна',                  'Весна',                    'Көктем',                   'Spring', LY],
  ['Девушка в саукеле',      'Девушка в саукеле',        'Сәукелелі қыз',            'Girl in a Saukele', LY],
  ['Ертаргын- батыр',        'Ер-Таргын батыр',          'Ер Тарғын',                'Yer-Targyn Batyr', IL],
  ['Әл Фараби',              'Аль-Фараби',               'Әл-Фараби',                'Al-Farabi', R],
  ['Золотой войн',           'Золотой воин',             'Алтын адам',               'The Golden Warrior', R],
  ['Караван.Шелковый',       'Караван. Шёлковый путь',   'Керуен. Жібек жолы',       'Caravan. The Silk Road', LA],
  ['Керуен (Караван)',       'Караван',                  'Керуен',                   'The Caravan', LA],
  ['Кобыланды-батыр',        'Кобланды батыр',           'Қобыланды батыр',          'Koblandy Batyr', IL],
  ['Кокшетау',               'Кокшетау',                 'Көкшетау',                 'Kokshetau', LA],
  ['Камбар-батыр',           'Камбар батыр',             'Қамбар батыр',             'Kambar Batyr', IL],
  ['Қорқыт ата (аңыз)',      'Коркыт ата (легенда)',     'Қорқыт ата (аңыз)',        'Korkyt Ata (Legend)', LY],
  ['Қыз-Жібек',              'Кыз-Жибек',                'Қыз Жібек',                'Kyz-Zhibek', LY],
  ['Қызыр баба',             'Кызыр баба. Четыре стихии','Қызыр баба. Төрт түлік',   'Kyzyr Baba', LY],
  ['Легенда о Коркыт-ата',   'Легенда о Коркыт-ата',     'Қорқыт ата туралы аңыз',   'The Legend of Korkyt Ata', LY],
  ['Легенда о Қорқыт ата',   'Легенда о Коркыт-ата',     'Қорқыт ата туралы аңыз',   'The Legend of Korkyt Ata', LY],
  ['Мать и дитя',            'Мать и дитя',              'Ана мен бала',             'Mother and Child', LY],
  ['Мөде Қаған (Резиденция', 'Каган Моде',               'Мөде қаған',               'Kagan Mode', R],
  ['Натюрморт',              'Натюрморт',                'Натюрморт',                'Still Life', LY],
  ['Наурыз',                 'Наурыз',                   'Наурыз',                   'Nauryz', LY],
  ['Невеста',                'Невеста',                  'Қалыңдық',                 'The Bride', LY],
  ['Огуз хан',               'Огуз хан',                 'Оғыз хан',                 'Oguz Khan', R],
  ['Ораз-Мұхаммед',          'Ораз-Мухаммед Касымулы',   'Ораз-Мұхаммед Қасымұлы',   'Oraz-Mukhammed Kasymuly', R],
  ['Охота',                  'Охота',                    'Аң аулау',                 'The Hunt', LA],
  ['Саки сражение',          'Саки. Сражение',           'Сақтар шайқасы',           'The Saka. Battle', R],
  ['Степные пейзажи',        'Степной пейзаж',           'Дала пейзажы',             'Steppe Landscape', LA],
  ['Сыр алаштын анасы',      'Мать Сыр-Алаша',           'Сыр Алаштың анасы',        'Mother of Syr-Alash', LY],
  ['Томирис (Перед',         'Томирис. Перед походом',   'Томирис. Жорық алдында',   'Tomyris. Before the Campaign', R],
  ['Томирис (сражение',      'Томирис. Сражение',        'Томирис. Шайқас',          'Tomyris. The Battle', R],
  ['Туркестан Шолковый',     'Туркестан. Шёлковый путь', 'Түркістан. Жібек жолы',    'Turkestan. The Silk Road', LA],
  ['Туркестан,',             'Туркестан',                'Түркістан',                'Turkestan', LA],
  ['Царица Саков - Томирис', 'Царица саков. Томирис',    'Сақ патшайымы Томирис',    'Tomyris, Queen of the Saka', R],
  ['Шыңгыс хан',             'Чингисхан',                'Шыңғыс хан',               'Genghis Khan', R],
  // «Каган Моде» (без уточнения) и «Күлтегін» — общие префиксы, ставим в конец списка масла,
  // но т.к. матчинг по длиннейшему префиксу — порядок не важен:
  ['Каган Моде',             'Каган Моде',               'Мөде қаған',               'Kagan Mode', R],
  ['Күлтегін',               'Культегин',                'Күлтегін',                 'Kultegin', R],

  // ── АКВАРЕЛЬ ──────────────────────────────────────────
  ['Абулхаир хан',           'Абулхаир хан',             'Әбілқайыр хан',            'Abulkhair Khan', R],
  ['Абылай хан',             'Абылай хан',               'Абылай хан',               'Ablai Khan', R],
  ['Айман-Шолпан (иллюстрация','Айман-Шолпан',           'Айман-Шолпан',             'Aiman-Sholpan', LY],
  ['Айтеке би',              'Айтеке би',                'Әйтеке би',                'Aiteke Bi', R],
  ['Алпамыс батыр',          'Алпамыс батыр',            'Алпамыс батыр',            'Alpamys Batyr', IL],
  ['Ертарғын (Эпос)',        'Ер-Таргын (эпос)',         'Ер Тарғын (эпос)',         'Yer-Targyn (epic)', IL],
  ['Ертарғын',               'Ер-Таргын',                'Ер Тарғын',                'Yer-Targyn', IL],
  ['Есим хан',               'Есим хан',                 'Есім хан',                 'Yesim Khan', R],
  ['Жекпе жек',              'Поединок (серия «Ер-Таргын»)','Жекпе-жек («Ер Тарғын»)','The Duel (Yer-Targyn series)', IL],
  ['Каган Моде (с народом',  'Каган Моде с народом',     'Мөде қаған (елімен)',      'Kagan Mode with His People', R],
  ['Каган Моде в бою',       'Каган Моде в бою',         'Мөде қаған шайқаста',      'Kagan Mode in Battle', R],
  ['Китайский император',    'Китайский император',      'Қытай императоры',         'The Chinese Emperor', IL],
  ['Қазыбек би',             'Казыбек би',               'Қазыбек би',               'Kazybek Bi', R],
  ['Қыз Жібек',              'Кыз-Жибек',                'Қыз Жібек',                'Kyz-Zhibek', LY],
  ['Мөде Қаған (иллюст',     'Каган Моде',               'Мөде қаған',               'Kagan Mode', R],
  ['Предсказания шаманов',   'Предсказания шаманов',     'Бақсылар болжамы',         "The Shamans' Prophecy", IL],
  ['Провоглошение гуннами',  'Провозглашение хана',      'Хан көтеру',               'Proclaiming the Khan', R],
  ['Серия иллюстраций к книге Абай','Иллюстрации к книге «Абай»','«Абай» кітабының иллюстрациялары','Illustrations for "Abai"', IL],
  ['Серия иллюстраций',      'Серия иллюстраций',        'Иллюстрациялар сериясы',   'Illustration Series', IL],
  ['Төле би',                'Толе би',                  'Төле би',                  'Tole Bi', R],
  ['эхо веков',              'Эхо веков',                'Ғасырлар үні',             'Echo of Centuries', LA],

  // ── КАРАНДАШ / ЛИТОГРАФИЯ ─────────────────────────────
  ['Абулхаирхан',            'Абулхаир хан',             'Әбілқайыр хан',            'Abulkhair Khan', R],
  ['Айман (гол.в саукеле',   'Айман в саукеле',          'Сәукелелі Айман',          'Aiman in a Saukele', LY],
  ['Айман (илл',             'Айман',                    'Айман',                    'Aiman', LY],
  ['Айман и мальчик',        'Айман и мальчик',          'Айман мен бала',           'Aiman and the Boy', LY],
  ['Айман Шолпан в плену',   'Айман-Шолпан в плену',     'Тұтқындағы Айман-Шолпан',  'Aiman-Sholpan in Captivity', LY],
  ['Айман-Шолпан 48',        'Айман-Шолпан',             'Айман-Шолпан',             'Aiman-Sholpan', LY],
  ['Айналайын азаттык',      'Айналайын, азаттык',       'Айналайын, азаттық',       'Ainalayyn, Azattyq', IL],
  ['Девушка на коне',        'Девушка на коне',          'Атқа мінген қыз',          'Girl on Horseback', LY],
  ['Керқұла атты Кендебай',  'Кендебай на коне Керкула', 'Керқұла атты Кендебай',    'Kendebai on Kerkula', IL],
  ['Колыбальная',            'Колыбельная',              'Бесік жыры',               'Lullaby', LY],
  ['Кыз-Ж1бек',              'Кыз-Жибек',                'Қыз Жібек',                'Kyz-Zhibek', LY],
  ['Қамбар батыр',           'Камбар батыр',             'Қамбар батыр',             'Kambar Batyr', IL],
  ['Қобыланды батыр',        'Кобланды батыр',           'Қобыланды батыр',          'Koblandy Batyr', IL],
  ['Молодой Абылай',         'Молодой Абылай',           'Жас Абылай',               'Young Abylai', R],
  ['Мөде Қаған',             'Каган Моде',               'Мөде қаған',               'Kagan Mode', R],
  ['Подвиг Ширака',          'Подвиг Ширака',            'Ширақ ерлігі',             'The Feat of Shirak', R],
  ['Провоглошение Чингиз',   'Провозглашение Чингисхана','Шыңғыс ханды жариялау',    'The Proclamation of Genghis Khan', R],
  ['Серия для книги Абылайхан 1','Абылай хан','Абылай хан','Ablai Khan', R],
  ['Серия для книги Абылайхан 2','Абылай хан','Абылай хан','Ablai Khan', R],
  ['Сражение (илл',          'Сражение',                 'Шайқас',                   'The Battle', IL],
  ['Сүйінші',                'Суюнши',                   'Сүйінші',                  'Suyinshi', LY],
  ['Т. Жүргенов (иллюстрация к книге, вариант 1','Т. Жургенов. Вариант 1','Т. Жүргенов. 1-нұсқа','T. Zhurgenov. Variant 1', IL],
  ['Т. Жүргенов (иллюстрация к книге, вариант 2','Т. Жургенов. Вариант 2','Т. Жүргенов. 2-нұсқа','T. Zhurgenov. Variant 2', IL],
  ['Той.',                   'Той',                      'Той',                      'The Toi', LY],
  ['Томирис',                'Томирис',                  'Томирис',                  'Tomyris', R],
  ['Царица (Саки',           'Царица саков',             'Сақ патшайымы',            'Queen of the Saka', R],
  ['Царь Кир',               'Царь Кир',                 'Кир патша',                'King Cyrus', R],
  ['Чингиз хан (иллюстрация', 'Чингисхан',               'Шыңғыс хан',               'Genghis Khan', R],
  ['Чингиз хан',             'Чингисхан',                'Шыңғыс хан',               'Genghis Khan', R],
  ['Эхо веков',              'Эхо веков',                'Ғасырлар үні',             'Echo of Centuries', LA],
];

function norm(name) {
  return name.replace(/\.(jpe?g|png|tiff?)$/i, '')
    .replace(/[«»“”"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function lookup(name) {
  const n = norm(name).toLowerCase();
  let best = null;
  for (const e of MAP) {
    const p = e[0].replace(/[«»“”"']/g, '').toLowerCase();
    if (n.startsWith(p) && (!best || p.length > best._len)) best = { ru: e[1], kz: e[2], en: e[3], c: e[4], _len: p.length };
  }
  return best;
}

// Водяной знак © — вшивается ПОВТОРЯЮЩИМСЯ ДИАГОНАЛЬНЫМ узором по всей картине
// (а не одной подписью в углу), поэтому его нельзя обрезать и видно всегда.
// Сохраняется при скачивании файла (в отличие от CSS-наложения в лайтбоксе).
function watermark(w, h) {
  const fs = Math.max(14, Math.round(w / 50));
  const text = '©  Ағымсалы Дүзелханов';
  const stepX = Math.round(w * 0.38);
  const stepY = Math.round(fs * 5);
  const sw = Math.max(0.6, fs / 22);
  let tiles = '';
  let row = 0;
  for (let y = -Math.round(h * 0.12); y < h + stepY; y += stepY) {
    const offset = (row % 2) * Math.round(stepX / 2);
    for (let x = -Math.round(w * 0.12) + offset; x < w + stepX; x += stepX) {
      tiles += `<text x="${x}" y="${y}" transform="rotate(-30 ${x} ${y})" `
        + `font-family="Georgia,'Times New Roman',serif" font-size="${fs}" `
        + `fill="#ffffff" fill-opacity="0.30" stroke="#000000" stroke-opacity="0.18" `
        + `stroke-width="${sw}" paint-order="stroke">${text}</text>`;
    }
    row++;
  }
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${tiles}</svg>`);
}

const works = [];
const counters = {};
for (const g of groups) {
  const dir = path.join(SRC, g.dir);
  if (!existsSync(dir)) { console.log('NO DIR', g.dir); continue; }
  const files = readdirSync(dir).filter(f => /\.(jpe?g|png|tiff?)$/i.test(f)).sort();
  let ok = 0;
  for (const f of files) {
    counters[g.tech] = (counters[g.tech] || 0) + 1;
    const out = `${g.tech}-${String(counters[g.tech]).padStart(3, '0')}.jpg`;
    try {
      const base = await sharp(path.join(dir, f), { limitInputPixels: false }).rotate()
        .resize({ width: 1700, height: 1700, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      const m = await sharp(base).metadata();
      const full = await sharp(base)
        .composite([{ input: watermark(m.width, m.height), top: 0, left: 0 }])
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toBuffer();
      writeFileSync(path.join(OUT, out), full);
      // миниатюра для сетки галереи (водяной знак масштабируется вместе с картинкой)
      await sharp(full)
        .resize({ width: 820, withoutEnlargement: true })
        .jpeg({ quality: 74, progressive: true, mozjpeg: true })
        .toFile(path.join(THUMB, out));
    } catch (e) { console.log('ERR', f, e.message); continue; }

    let t, c, base = null;
    if (NUMBERED[g.tech]) {                 // наброски → «Зарисовки и эскизы», детские → «Из серии работ к детским книгам»
      t = { ...NUMBERED[g.tech] };
      c = g.tech === 'kids' ? 'kids' : 'sketches';
    } else {
      const m = lookup(f);
      if (m) {
        t = { ru: m.ru, kz: m.kz, en: m.en }; c = m.c;
      } else {                              // на всякий случай — общая подпись
        const GEN = { oil:{ru:'Картина',kz:'Туынды',en:'Painting'}, water:{ru:'Графика',kz:'График',en:'Graphic work'}, pencil:{ru:'Графика',kz:'График',en:'Graphic work'} }[g.tech];
        t = { ...GEN }; c = 'misc';
        console.log('NO MATCH:', g.tech, '←', f);
      }
      base = { ...t };                      // запоминаем базовое имя для группировки в серии
    }
    works.push({ img: `assets/works/${out}`, f: g.tech, c, t, d: DLAB[g.tech], _base: base });
    ok++;
  }
  console.log(`${g.tech}: ${ok} файлов`);
}

// Серии: если в масле/графике одинаковое название встречается ≥2 раз —
// заменяем индивидуальные подписи на «Из серии работ «…»».
const baseCount = {};
for (const w of works) if (w._base) baseCount[w._base.ru] = (baseCount[w._base.ru] || 0) + 1;
for (const w of works) {
  if (w._base && baseCount[w._base.ru] >= 2) {
    w.t = {
      ru: `Из серии работ «${w._base.ru}»`,
      kz: `«${w._base.kz}» сериясынан`,
      en: `From the ${w._base.en} series`,
    };
  }
  delete w._base;
}
const report = works.map(w => `${w.img.split('/').pop()}  [${w.c}]  ${w.t.ru}`);

const js = 'const WORKS=' + JSON.stringify(works) + ';\n';
writeFileSync('D:/WORK/Claude Code/duzelkhanov-site/works-data.js', js, 'utf8');
console.log(`\nВсего работ: ${works.length}. Записано в works-data.js`);

// Фон главного экрана (hero) — широкий кадр «Охоты». Папка works очищается при сборке,
// поэтому hero пересоздаём здесь, чтобы он не пропадал.
const heroSrc = path.join(SRC, 'Масляные работы/для сайта/Охота (х.м.60х120,2000г.- в корпорации Атамура).jpg');
if (existsSync(heroSrc)) {
  await sharp(heroSrc, { limitInputPixels: false }).rotate()
    .resize({ width: 2400, fit: 'inside', withoutEnlargement: true })
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 88, progressive: true, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(OUT, 'hero-hunt.jpg'));
  console.log('hero-hunt.jpg ← Охота');
}

// Баннер раздела «Эссе» — степная панорама (приаральская степь у Сырдарьи).
const steppeSrc = path.join(SRC, 'Масляные работы/для сайта/Степные пейзажи (из серии картин для Кызылорды, х.масло).JPG');
if (existsSync(steppeSrc)) {
  await sharp(steppeSrc, { limitInputPixels: false }).rotate()
    .resize({ width: 2800, fit: 'inside', withoutEnlargement: true })
    .sharpen({ sigma: 0.5 })
    .jpeg({ quality: 88, progressive: true, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(OUT, 'essay-steppe.jpg'));
  console.log('essay-steppe.jpg ← Степные пейзажи');
}
console.log('\n— Сводка названий —\n' + report.join('\n'));

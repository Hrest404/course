// Каталог курсов для сайта строится из xlsx (лист с колонками «Курс», «Направление», «Цена…»)
// и docx (раздел «Программа» под заголовком с названием курса) в папке rag/.
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import ExcelJS from 'exceljs';
import mammoth from 'mammoth';

const plain = (v) => (v && typeof v === 'object' ? (v.text ?? v.result ?? (v.richText ? v.richText.map((r) => r.text).join('') : '')) : v);
const str = (v) => String(plain(v) ?? '').trim();
const num = (v) => {
  const n = Number(String(plain(v) ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) && String(plain(v) ?? '').trim() !== '' ? n : null;
};
const key = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();

// Колонки ищем по тексту заголовка, чтобы порядок и подписи могли немного отличаться.
const COLUMNS = {
  title: (h) => h === 'курс',
  direction: (h) => h.startsWith('направление'),
  age: (h) => h.includes('возраст'),
  months: (h) => h.includes('длительность'),
  lessons: (h) => h.includes('занят'),
  format: (h) => h.startsWith('формат'),
  price: (h) => h.includes('standard') || h.startsWith('цена'),
  pricePremium: (h) => h.includes('premium'),
  installment: (h) => h.startsWith('рассрочка'),
  salary: (h) => h.includes('зарплат'),
  teachers: (h) => h.startsWith('преподават'),
  url: (h) => h === 'url' || h.startsWith('ссылка'),
};

async function coursesFromXlsx(file) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const out = [];
  for (const ws of wb.worksheets) {
    const headers = (ws.getRow(1).values ?? []).slice(1).map((h) => key(str(h)));
    const col = {};
    for (const [name, test] of Object.entries(COLUMNS)) {
      const i = headers.findIndex(test);
      if (i >= 0 && !Object.values(col).includes(i + 1)) col[name] = i + 1;
    }
    if (!col.title || !col.direction || !col.price) continue; // не лист курсов
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const get = (name) => (col[name] ? row.getCell(col[name]).value : null);
      const title = str(get('title'));
      if (!title) return;
      out.push({
        title,
        direction: str(get('direction')) || 'Другое',
        age: num(get('age')),
        months: num(get('months')),
        lessons: num(get('lessons')),
        format: str(get('format')) || 'не указан',
        price: num(get('price')),
        pricePremium: num(get('pricePremium')),
        installment: str(get('installment')) || null,
        salary: num(get('salary')),
        teachers: str(get('teachers')).split(/[;,]/).map((t) => t.trim()).filter(Boolean),
        url: str(get('url')) || null,
      });
    });
  }
  return out;
}

const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

// { название курса -> [пункты программы] } из docx: h1 = курс, <li> после h2 «Программа».
async function programsFromDocx(file) {
  const { value: html } = await mammoth.convertToHtml({ path: file });
  const map = new Map();
  for (const part of html.split(/(?=<h1>)/)) {
    const m = part.match(/^<h1>(.*?)<\/h1>/);
    if (!m) continue;
    const idx = part.search(/<h2>\s*Программа\s*<\/h2>/i);
    if (idx < 0) continue;
    const items = [...part.slice(idx).matchAll(/<li>(.*?)<\/li>/gs)].map((x) => strip(x[1])).filter(Boolean);
    if (items.length) map.set(key(strip(m[1])), items);
  }
  return map;
}

export async function buildCourses(dir) {
  const files = (await readdir(dir)).filter((n) => !n.startsWith('~$') && !n.startsWith('.')).sort();
  const rows = [];
  const programs = new Map();
  for (const name of files) {
    const ext = path.extname(name).toLowerCase();
    try {
      if (ext === '.xlsx') rows.push(...(await coursesFromXlsx(path.join(dir, name))));
      else if (ext === '.docx') for (const [k, v] of await programsFromDocx(path.join(dir, name))) programs.set(k, v);
    } catch (e) {
      console.warn(`Каталог: не удалось прочитать ${name}: ${e.message}`);
    }
  }
  const seen = new Set();
  return rows
    .filter((c) => !seen.has(key(c.title)) && seen.add(key(c.title)))
    .map((c) => ({ id: key(c.title), ...c, program: programs.get(key(c.title)) ?? [] }));
}

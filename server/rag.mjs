// Парсинг и индексация документов из rag/ + BM25-поиск.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

const MAX_CHUNK = 900;

// Грубый стемминг для русского/латиницы: нижний регистр + первые 5 букв слова.
export function tokenize(text) {
  return (text.toLowerCase().match(/[a-zа-яё0-9]+/g) ?? []).map((w) => (w.length > 5 ? w.slice(0, 5) : w));
}

// Делит текст раздела на куски <= MAX_CHUNK по абзацам; к каждому добавляет заголовок.
function splitSection(title, body) {
  const out = [];
  let cur = '';
  for (const para of body.split(/\n+/).map((p) => p.trim()).filter(Boolean)) {
    if (cur && cur.length + para.length > MAX_CHUNK) {
      out.push(cur);
      cur = '';
    }
    cur += (cur ? '\n' : '') + para;
  }
  if (cur) out.push(cur);
  return out.map((text) => ({ section: title, text: title ? `${title}\n${text}` : text }));
}

function parseText(raw) {
  // Разделы txt/md: строки вида "== ЗАГОЛОВОК ==" или "# Заголовок".
  const chunks = [];
  let title = '';
  let buf = [];
  const flush = () => {
    if (buf.join('').trim()) chunks.push(...splitSection(title, buf.join('\n')));
    buf = [];
  };
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^==\s*(.+?)\s*==$/) ?? line.match(/^#{1,3}\s+(.+)$/);
    if (m) {
      flush();
      title = m[1];
    } else buf.push(line);
  }
  flush();
  return chunks;
}

async function parseDocx(file) {
  const { value: html } = await mammoth.convertToHtml({ path: file });
  const strip = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ');
  const chunks = [];
  // Разделы по <h1>/<h2>; заголовок h1 (название курса) добавляется к вложенным разделам.
  let h1 = '';
  for (const part of html.split(/(?=<h[12]>)/)) {
    const m = part.match(/^<h([12])>(.*?)<\/h\1>/);
    let title = '';
    if (m) {
      const t = strip(m[2]).trim();
      if (m[1] === '1') {
        h1 = t;
        title = t;
      } else title = `${h1} — ${t}`;
    }
    const body = strip(part.replace(/^<h[12]>.*?<\/h[12]>/, '').replace(/<\/(p|li)>/g, '\n'));
    if (body.trim()) chunks.push(...splitSection(title, body));
  }
  return chunks;
}

async function parseXlsx(file) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  const chunks = [];
  for (const ws of wb.worksheets) {
    const headers = (ws.getRow(1).values ?? []).slice(1).map(String);
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const cells = (row.values ?? []).slice(1);
      if (!cells.some((c) => c !== null && c !== undefined && c !== '')) return;
      const text = cells.length === 1 ? String(cells[0]) : headers.map((h, i) => (cells[i] != null && cells[i] !== '' ? `${h}: ${cells[i]}` : null)).filter(Boolean).join('; ');
      chunks.push({ section: `${ws.name}, строка ${n}`, text: `${ws.name}. ${text}` });
    });
  }
  return chunks;
}

const PARSERS = {
  '.txt': async (f) => parseText(await readFile(f, 'utf8')),
  '.md': async (f) => parseText(await readFile(f, 'utf8')),
  '.docx': parseDocx,
  '.xlsx': parseXlsx,
};

export async function buildIndex(dir) {
  const docs = [];
  for (const name of (await readdir(dir)).sort()) {
    const parse = PARSERS[path.extname(name).toLowerCase()];
    // Пропускаем README и временные файлы Office (~$...) / скрытые.
    if (!parse || name.toLowerCase() === 'readme.md' || name.startsWith('~$') || name.startsWith('.')) continue;
    try {
      for (const c of await parse(path.join(dir, name))) docs.push({ source: name, ...c });
    } catch (e) {
      // Файл может быть не дописан или повреждён — не роняем всю индексацию.
      console.warn(`RAG: не удалось прочитать ${name}: ${e.message}`);
    }
  }
  // BM25
  const tfs = docs.map((d) => {
    const tf = new Map();
    for (const t of tokenize(d.text)) tf.set(t, (tf.get(t) ?? 0) + 1);
    d.len = [...tf.values()].reduce((a, b) => a + b, 0);
    return tf;
  });
  const df = new Map();
  for (const tf of tfs) for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLen = docs.reduce((a, d) => a + d.len, 0) / (docs.length || 1);
  return { docs, tfs, df, avgLen };
}

export function search(index, query, limit = 5) {
  const { docs, tfs, df, avgLen } = index;
  const N = docs.length;
  const k1 = 1.5;
  const b = 0.75;
  const q = [...new Set(tokenize(query))];
  return docs
    .map((d, i) => {
      let score = 0;
      for (const t of q) {
        const f = tfs[i].get(t);
        if (!f) continue;
        const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
        score += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avgLen));
      }
      return { ...d, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Ответ на вопрос по базе знаний: поиск фрагментов + генерация Gemini. Общий код для
// локального сервиса (server/index.mjs) и serverless-функций Vercel (api/).
import { search } from './rag.mjs';

async function askGemini(question, hits) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const context = hits.map((h, i) => `[${i + 1}] (${h.source} — ${h.section})\n${h.text}`).join('\n\n');
  const prompt =
    'Ты — AI-тьютор учебного центра. Отвечай по-русски, кратко и только на основе фрагментов ниже. ' +
    'Если в них нет ответа — так и скажи, ничего не выдумывай. Ссылайся на источники номерами [1], [2].\n\n' +
    `Фрагменты:\n${context}\n\nВопрос: ${question}`;
  const call = () =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
  let res = await call();
  // Перегрузка (503) обычно кратковременная — пробуем ещё раз.
  if (res.status === 503) {
    await new Promise((r) => setTimeout(r, 1500));
    res = await call();
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
}

/** @returns {Promise<{answer: string, sources: object[], mode: 'gemini'|'search-only'|'none'}>} */
export async function answerQuestion(index, question) {
  const hits = search(index, question, 5);
  const sources = hits.map((h) => ({ source: h.source, section: h.section, snippet: h.text.slice(0, 300) }));
  if (!hits.length) return { answer: 'В базе знаний нет информации по этому вопросу.', sources: [], mode: 'none' };
  if (!process.env.GEMINI_API_KEY) {
    return { answer: 'Ключ GEMINI_API_KEY не задан — показаны найденные фрагменты базы знаний.', sources, mode: 'search-only' };
  }
  try {
    return { answer: await askGemini(question, hits), sources, mode: 'gemini' };
  } catch (e) {
    console.error(e);
    return { answer: 'Gemini сейчас недоступен — показаны найденные фрагменты базы знаний.', sources, mode: 'search-only' };
  }
}

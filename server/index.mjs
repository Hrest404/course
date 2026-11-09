// RAG-сервис: POST /api/chat { question } -> { answer, sources, mode }
// Запуск: npm run server (читает .env через --env-file)
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { watch } from 'node:fs';
import { buildIndex } from './rag.mjs';
import { answerQuestion } from './chat.mjs';
import { buildCourses } from './courses.mjs';
import { GoogleDriveConnector } from './connectors/google-drive.mjs';

const PORT = Number(process.env.RAG_PORT ?? 8787);
const RAG_DIR = process.env.RAG_DIR ?? './rag';
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';

const drive = new GoogleDriveConnector({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  serviceAccountFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE,
  ragDir: RAG_DIR,
  tokenFile: new URL('./.google-drive-state.json', import.meta.url),
});
const connectors = { [drive.id]: drive };
const oauthStates = new Set(); // одноразовые state для защиты OAuth от подделки запроса

let index = await buildIndex(RAG_DIR);
let courses = await buildCourses(RAG_DIR);
// Перечитывает всю базу: поисковый индекс и каталог курсов для сайта.
async function refresh() {
  index = await buildIndex(RAG_DIR);
  courses = await buildCourses(RAG_DIR);
}
console.log(`RAG: проиндексировано ${index.docs.length} фрагментов из ${RAG_DIR}`);

// Автообновление: любое добавление/изменение/удаление файла в rag/ переиндексирует базу.
let reindexTimer;
watch(RAG_DIR, () => {
  clearTimeout(reindexTimer);
  reindexTimer = setTimeout(async () => {
    try {
      await refresh();
      console.log(`RAG: база обновлена, ${index.docs.length} фрагментов`);
    } catch (e) {
      console.error('RAG: ошибка автообновления', e);
    }
  }, 600); // ждём, пока файл допишется
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => resolve(s));
    req.on('error', reject);
  });
}

const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'POST' && url.pathname === '/api/reindex') {
        await refresh();
        return send(res, 200, { fragments: index.docs.length });
      }
      if (req.method === 'GET' && url.pathname === '/api/courses') return send(res, 200, courses);
      if (req.method === 'GET' && url.pathname === '/api/connectors') {
        const list = [{ id: 'local', name: 'Локальная папка rag/', configured: true, connected: true, fragments: index.docs.length }];
        for (const c of Object.values(connectors)) list.push({ id: c.id, name: c.name, ...(await c.status()) });
        return send(res, 200, list);
      }
      if (req.method === 'GET' && url.pathname === '/api/connectors/google-drive/connect') {
        if (!drive.isConfigured() || drive.serviceAccountFile) return send(res, 400, { error: 'OAuth-вход недоступен: Drive работает через сервисный аккаунт или не настроен' });
        const state = randomBytes(16).toString('hex');
        oauthStates.add(state);
        res.writeHead(302, { Location: drive.authUrl(state) });
        return res.end();
      }
      if (req.method === 'GET' && url.pathname === '/auth/google/callback') {
        const state = url.searchParams.get('state') ?? '';
        const code = url.searchParams.get('code');
        let result = 'connected';
        if (!oauthStates.delete(state) || !code) result = 'error';
        else {
          try {
            await drive.exchangeCode(code);
          } catch (e) {
            console.error(e);
            result = 'error';
          }
        }
        res.writeHead(302, { Location: `${FRONTEND_URL}/?drive=${result}` });
        return res.end();
      }
      if (req.method === 'POST' && url.pathname === '/api/connectors/google-drive/sync') {
        const summary = await drive.sync();
        await refresh();
        return send(res, 200, { ...summary, fragments: index.docs.length });
      }
      if (req.method !== 'POST' || url.pathname !== '/api/chat') return send(res, 404, { error: 'not found' });

      const { question } = JSON.parse((await readBody(req)) || '{}');
      if (!question || typeof question !== 'string') return send(res, 400, { error: 'question required' });

      return send(res, 200, await answerQuestion(index, question));
    } catch (e) {
      console.error(e);
      send(res, 500, { error: String(e.message ?? e) });
    }
  })
  .listen(PORT, '127.0.0.1', () => console.log(`RAG-сервис: http://localhost:${PORT}`));

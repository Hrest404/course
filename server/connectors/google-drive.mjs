// Google Drive: OAuth (readonly) + зеркалирование папки Drive в rag/ с префиксом gdrive_.
import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createSign } from 'node:crypto';
import { KnowledgeConnector } from './knowledge-connector.mjs';

const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const PREFIX = 'gdrive_';
const MIME = {
  doc: 'application/vnd.google-apps.document',
  sheet: 'application/vnd.google-apps.spreadsheet',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// Что скачивать и в каком формате; остальное (PDF, картинки и т.д.) пропускаем.
function plan(file) {
  switch (file.mimeType) {
    case MIME.doc: return { ext: '.docx', exportAs: MIME.docx };
    case MIME.sheet: return { ext: '.xlsx', exportAs: MIME.xlsx };
    case MIME.docx: return { ext: '.docx' };
    case MIME.xlsx: return { ext: '.xlsx' };
    case 'text/plain': return { ext: '.txt' };
    case 'text/markdown': return { ext: '.md' };
    default: return null;
  }
}

const safeName = (name) =>
  name.replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}_-]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'file';

export class GoogleDriveConnector extends KnowledgeConnector {
  constructor({ clientId, clientSecret, redirectUri, folderId, ragDir, tokenFile, serviceAccountFile }) {
    super('google-drive', 'Google Drive');
    Object.assign(this, { clientId, clientSecret, redirectUri, folderId, ragDir, tokenFile, serviceAccountFile });
  }

  // Два способа доступа: сервисный аккаунт (ключ-файл, папка Drive расшарена на его email)
  // или OAuth пользователя. Если задан ключ-файл, используется он.
  isConfigured() {
    const oauth = this.clientId && this.clientSecret && this.redirectUri;
    return Boolean(this.folderId && (this.serviceAccountFile || oauth));
  }

  async #serviceAccount() {
    if (!this.serviceAccountFile) return null;
    try {
      const key = JSON.parse(await readFile(this.serviceAccountFile, 'utf8'));
      return key.client_email && key.private_key ? key : null;
    } catch {
      return null;
    }
  }

  async #serviceAccountToken(key) {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const head = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: key.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
    const sig = createSign('RSA-SHA256').update(head).sign(key.private_key, 'base64url');
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${head}.${sig}` }),
    });
    if (!res.ok) throw new Error(`Google OAuth ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return (await res.json()).access_token;
  }

  async #loadState() {
    try {
      return JSON.parse(await readFile(this.tokenFile, 'utf8'));
    } catch {
      return {};
    }
  }

  async #saveState(patch) {
    await writeFile(this.tokenFile, JSON.stringify({ ...(await this.#loadState()), ...patch }, null, 2));
  }

  async status() {
    const s = await this.#loadState();
    const sa = await this.#serviceAccount();
    return {
      configured: this.isConfigured(),
      mode: this.serviceAccountFile ? 'service-account' : 'oauth',
      connected: Boolean(sa || s.refresh_token),
      lastSync: s.lastSync ?? null,
      files: s.files ?? null,
    };
  }

  authUrl(state) {
    const q = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  }

  async #token(params) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: this.clientId, client_secret: this.clientSecret, ...params }),
    });
    if (!res.ok) throw new Error(`Google OAuth ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res.json();
  }

  async exchangeCode(code) {
    const t = await this.#token({ code, grant_type: 'authorization_code', redirect_uri: this.redirectUri });
    if (!t.refresh_token) throw new Error('Google не вернул refresh_token — отзовите доступ приложению и повторите подключение');
    await this.#saveState({ refresh_token: t.refresh_token });
  }

  async #accessToken() {
    if (this.serviceAccountFile) {
      const key = await this.#serviceAccount();
      if (!key) throw new Error(`Ключ сервисного аккаунта не найден или повреждён: ${this.serviceAccountFile}`);
      return this.#serviceAccountToken(key);
    }
    const { refresh_token } = await this.#loadState();
    if (!refresh_token) throw new Error('Google Drive не подключён');
    return (await this.#token({ refresh_token, grant_type: 'refresh_token' })).access_token;
  }

  async #api(url, token) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Drive API ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res;
  }

  async #listFiles(token) {
    const files = [];
    let pageToken = '';
    do {
      const q = new URLSearchParams({
        q: `'${this.folderId}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageSize: '100',
        ...(pageToken && { pageToken }),
      });
      const data = await (await this.#api(`https://www.googleapis.com/drive/v3/files?${q}`, token)).json();
      files.push(...data.files);
      pageToken = data.nextPageToken ?? '';
    } while (pageToken);
    return files;
  }

  async sync() {
    if (!this.isConfigured()) throw new Error('Google Drive не настроен: заполните GOOGLE_* в .env');
    const token = await this.#accessToken();
    const kept = new Set();
    for (const f of await this.#listFiles(token)) {
      const p = plan(f);
      if (!p) continue;
      const url = p.exportAs
        ? `https://www.googleapis.com/drive/v3/files/${f.id}/export?mimeType=${encodeURIComponent(p.exportAs)}`
        : `https://www.googleapis.com/drive/v3/files/${f.id}?alt=media`;
      const buf = Buffer.from(await (await this.#api(url, token)).arrayBuffer());
      const name = `${PREFIX}${safeName(f.name)}_${f.id.slice(0, 6)}${p.ext}`;
      await writeFile(path.join(this.ragDir, name), buf);
      kept.add(name);
    }
    // Зеркало: удаляем только наши gdrive_*-файлы, которых больше нет в папке Drive.
    let removed = 0;
    for (const name of await readdir(this.ragDir)) {
      if (name.startsWith(PREFIX) && !kept.has(name)) {
        await unlink(path.join(this.ragDir, name));
        removed++;
      }
    }
    await this.#saveState({ lastSync: new Date().toISOString(), files: kept.size });
    return { files: kept.size, removed };
  }
}

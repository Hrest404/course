// Абстракция источника знаний. Коннектор приносит документы в папку rag/,
// после чего сервис переиндексирует её (см. server/index.mjs).
export class KnowledgeConnector {
  /** @param {string} id @param {string} name */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  /** Заданы ли все настройки (ключи, id папки). */
  isConfigured() {
    return false;
  }

  /** Состояние для UI: { configured, connected, lastSync, files, ... } */
  async status() {
    return { configured: this.isConfigured(), connected: false };
  }

  /** Копирует документы источника в rag/. Возвращает { files, removed }. */
  async sync() {
    throw new Error(`Коннектор ${this.id} не поддерживает синхронизацию`);
  }
}

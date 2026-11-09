import { useEffect, useState } from 'react';
import { ArrowsClockwise, CheckCircle, Warning } from '@phosphor-icons/react';

interface Connector {
  id: string;
  name: string;
  configured: boolean;
  connected: boolean;
  fragments?: number;
  lastSync?: string | null;
  files?: number | null;
  mode?: 'oauth' | 'service-account';
}

export function ConnectorsPanel() {
  const [list, setList] = useState<Connector[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(() => {
    const result = new URLSearchParams(window.location.search).get('drive');
    if (!result) return '';
    return result === 'connected' ? 'Google Drive подключён.' : 'Не удалось подключить Google Drive.';
  });

  // Список перезагружается при монтировании и после каждой синхронизации (смена reloadKey).
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch('/api/connectors')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error())))
      .then((data: Connector[]) => {
        if (!alive) return;
        setList(data);
        setError('');
      })
      .catch(() => alive && setError('RAG-сервис недоступен. Запустите npm run server.'));
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const sync = async () => {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/connectors/google-drive/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Синхронизировано файлов: ${data.files}, удалено: ${data.removed}. Фрагментов в базе: ${data.fragments}.`);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setMessage(e instanceof Error && e.message ? e.message : 'Ошибка синхронизации');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-lg text-white">Источники знаний</h3>
      {error && <p className="text-sm text-[#FF4D6D]">{error}</p>}
      {list?.map((c) => (
        <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-white text-sm">{c.name}</span>
            {c.connected ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={14} weight="fill" /> активен</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-zinc-400"><Warning size={14} /> не подключён</span>
            )}
          </div>

          {c.id === 'local' && <p className="mt-2 text-xs text-zinc-400">Фрагментов в индексе: {c.fragments}</p>}

          {c.id === 'google-drive' && (
            <div className="mt-2 space-y-2 text-xs text-zinc-400">
              {!c.configured && <p>Заполните GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_DRIVE_FOLDER_ID в .env и перезапустите сервис.</p>}
              {c.configured && !c.connected && c.mode === 'service-account' && (
                <p>Не найден ключ сервисного аккаунта. Проверьте путь GOOGLE_SERVICE_ACCOUNT_FILE в .env.</p>
              )}
              {c.configured && !c.connected && c.mode !== 'service-account' && (
                <a href="/api/connectors/google-drive/connect" className="inline-block rounded-full bg-[#8B001D] hover:bg-[#A5102A] px-4 py-2 text-sm font-semibold text-white transition-colors">
                  Подключить Google Drive
                </a>
              )}
              {c.connected && (
                <>
                  <p>
                    {c.lastSync ? `Последняя синхронизация: ${new Date(c.lastSync).toLocaleString('ru-RU')} (файлов: ${c.files})` : 'Синхронизации ещё не было'}
                  </p>
                  <button
                    type="button"
                    onClick={() => void sync()}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-full bg-[#8B001D] hover:bg-[#A5102A] disabled:opacity-50 px-4 py-2 text-sm font-semibold text-white transition-colors"
                  >
                    <ArrowsClockwise size={16} className={busy ? 'animate-spin' : ''} />
                    {busy ? 'Синхронизация…' : 'Синхронизировать'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      {message && <p className="text-sm text-zinc-200" role="status">{message}</p>}
    </div>
  );
}

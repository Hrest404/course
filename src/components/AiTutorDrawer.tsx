import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Database, FileText, PaperPlaneRight, Sparkle, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx } from 'clsx';
import { ConnectorsPanel } from './ConnectorsPanel';

interface Source {
  source: string;
  section: string;
  snippet: string;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sources?: Source[];
  note?: string;
}

const QUICK_QUESTIONS = [
  'Сколько стоит курс Frontend?',
  'Какая рассрочка у Аналитика данных?',
  'Где находятся филиалы?',
  'Что входит в тариф Premium?',
];

const SOURCE_LABELS: Record<string, string> = {
  'proweb_kursy_ceny_prepodavateli.xlsx': 'Курсы, цены, преподаватели',
  'proweb_programmy_kursov.docx': 'Программы курсов',
  'proweb_o_centre_oplata_faq.txt': 'О центре, оплата, FAQ',
};

// Gemini отвечает markdown-ом: показываем только **жирный**.
function formatBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" aria-label="Ассистент печатает" role="status">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#E52E4D]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// Постепенное появление текста ответа.
function Typewriter({ text, onTick }: { text: string; onTick: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const id = setTimeout(() => {
      setN((v) => Math.min(text.length, v + 3));
      onTick();
    }, 16);
    return () => clearTimeout(id);
  }, [n, text, onTick]);
  return <>{formatBold(text.slice(0, n))}</>;
}

interface AiTutorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiTutorDrawer({ open, onOpenChange }: AiTutorDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollDown = () => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false);
    window.addEventListener('keydown', onKey);
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    scrollDown();
  }, [messages, loading]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка сервиса');
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: data.answer,
          sources: data.sources,
          note: data.mode === 'search-only' ? 'Режим поиска: ответ без генерации' : undefined,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: 'Не удалось связаться с базой знаний. Проверьте, что RAG-сервис запущен (npm run server).' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <>
      {!open && (
        <motion.button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="Открыть AI-тьютора"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#8B001D] text-white flex items-center justify-center shadow-[0_0_30px_rgba(209,26,56,0.5)]"
        >
          <span className="absolute inset-0 rounded-full bg-[#D11A38]/50 animate-ping" aria-hidden="true" />
          <Sparkle size={24} weight="fill" className="relative" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <motion.aside
            role="dialog"
            aria-label="AI-тьютор"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="glass-panel-glow fixed z-50 bottom-0 right-0 sm:bottom-5 sm:right-5 w-full sm:w-[400px] h-[85dvh] sm:h-[600px] max-h-[100dvh] sm:rounded-2xl rounded-t-2xl flex flex-col overflow-hidden"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-[#8B001D] flex items-center justify-center">
                  <Sparkle size={18} weight="fill" className="text-white" />
                </span>
                <div>
                  <div className="font-display font-bold text-white leading-tight">AI-тьютор</div>
                  <div className="text-xs text-zinc-400">Отвечает по базе знаний</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSources((v) => !v)}
                  aria-label="Источники знаний"
                  aria-pressed={showSources}
                  className={clsx('p-2 rounded-full hover:bg-white/10', showSources ? 'text-[#E52E4D]' : 'text-zinc-300')}
                >
                  <Database size={18} />
                </button>
                <button type="button" onClick={() => onOpenChange(false)} aria-label="Закрыть" className="p-2 rounded-full hover:bg-white/10 text-zinc-300">
                  <X size={18} />
                </button>
              </div>
            </header>

            {showSources ? (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ConnectorsPanel />
              </div>
            ) : (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="pt-4">
                  <h3 className="font-display font-bold text-xl text-white">Привет! Чем помочь?</h3>
                  <p className="text-sm text-zinc-400 mt-2">
                    Спросите про курсы, цены, преподавателей или условия обучения. Ответ приходит со ссылками на источники.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {QUICK_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void ask(q)}
                        className="px-3 py-2 rounded-full border border-white/15 text-sm text-zinc-200 hover:border-[#8B001D] hover:bg-[#8B001D]/20 transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={clsx(
                      'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                      m.role === 'user' ? 'bg-[#8B001D] text-white' : 'bg-white/5 border border-white/10 text-zinc-100'
                    )}
                  >
                    {m.role === 'assistant' && i === messages.length - 1 ? <Typewriter text={m.text} onTick={scrollDown} /> : formatBold(m.text)}
                    {m.note && <div className="mt-2 text-xs text-[#FF4D6D]">{m.note}</div>}
                    {m.sources && m.sources.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                        {m.sources.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-zinc-400" title={s.snippet}>
                            <FileText size={14} className="mt-0.5 shrink-0 text-[#E52E4D]" />
                            <span>
                              <span className="font-mono-tech text-[#E52E4D] mr-1">[{j + 1}]</span>
                              <span className="text-zinc-200">{SOURCE_LABELS[s.source] ?? s.source}</span>
                              {s.section && <> · {s.section}</>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex">
                  <div className="rounded-2xl bg-white/5 border border-white/10">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
            )}

            <form onSubmit={onSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-white/10">
              <label htmlFor="ai-input" className="sr-only">Ваш вопрос</label>
              <input
                id="ai-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите вопрос…"
                className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#8B001D]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Отправить"
                className="w-10 h-10 rounded-full bg-[#8B001D] hover:bg-[#A5102A] disabled:opacity-40 flex items-center justify-center text-white transition-colors"
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

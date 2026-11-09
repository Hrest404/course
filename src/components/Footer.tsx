import { useState, type FormEvent } from 'react';

const SITEMAP = [
  { label: 'Главная', href: '#hero' },
  { label: 'О нас', href: '#manifesto' },
  { label: 'Направления', href: '#directions' },
  { label: 'Курсы', href: '#courses' },
  { label: 'Менторы', href: '#mentors' },
  { label: 'Почему EMBE', href: '#benefits' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Макет: подписка пока не отправляется на сервер.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSent(true);
  };

  return (
    <footer className="w-full bg-[#0a0a0d] border-t border-white/10 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h4 className="font-display font-bold text-2xl md:text-3xl text-white">Открытые лекции — на почту</h4>
            <p className="text-zinc-400 mt-2 text-sm">Раз в месяц: анонсы лекций и новые программы.</p>
            {sent ? (
              <p className="mt-5 text-[#E52E4D]" role="status">Спасибо! Вы подписаны.</p>
            ) : (
              <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-3 max-w-md">
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-full bg-white/5 border border-white/10 px-5 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#8B001D]"
                />
                <button type="submit" className="rounded-full bg-[#8B001D] hover:bg-[#A5102A] px-6 py-3 text-sm font-semibold text-white transition-colors">
                  Подписаться
                </button>
              </form>
            )}
          </div>

          <nav aria-label="Карта сайта">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
              {SITEMAP.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-zinc-300 hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 py-6 text-xs text-zinc-500">
          <span>© 2026 EMBE Academy. Все права защищены.</span>
          <span>Политика конфиденциальности · Публичная оферта</span>
        </div>
      </div>

      <div aria-hidden="true" className="font-display font-black text-[28vw] leading-[0.75] tracking-[-0.05em] text-[#8B001D]/80 text-center select-none -mb-[3vw]">
        EMBE
      </div>
    </footer>
  );
}

import { useState } from 'react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';

const BENEFITS = [
  {
    id: 'method',
    title: 'Методология',
    lead: 'Учимся на задачах, а не на лекциях ради лекций.',
    points: ['Короткие модули с понятным результатом', 'Разбор домашних заданий с ментором', 'Обратная связь на каждом этапе'],
  },
  {
    id: 'portfolio',
    title: 'Портфолио',
    lead: 'К выпуску у вас готовые кейсы, которые можно показать.',
    points: ['Реальные брифы вместо учебных упражнений', 'Дипломный проект на защиту', 'Помощь с оформлением кейсов'],
  },
  {
    id: 'career',
    title: 'Карьерный трек',
    lead: 'Помогаем сделать следующий шаг после курса.',
    points: ['Разбор резюме и портфолио', 'Закрытый канал с вакансиями', 'Подготовка к собеседованиям'],
  },
];

export function BenefitsSection() {
  const [active, setActive] = useState(BENEFITS[0].id);
  const current = BENEFITS.find((b) => b.id === active) ?? BENEFITS[0];

  return (
    <section id="benefits" className="w-full bg-[#070709] pb-24 md:pb-36">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="font-display font-bold text-2xl md:text-4xl text-white mb-10">Почему EMBE</h3>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div role="tablist" aria-label="Преимущества" className="flex flex-col gap-2">
            {BENEFITS.map((b, i) => (
              <button
                key={b.id}
                role="tab"
                type="button"
                aria-selected={b.id === active}
                onClick={() => setActive(b.id)}
                onMouseEnter={() => setActive(b.id)}
                className={clsx(
                  'text-left rounded-xl px-4 py-4 border transition-colors font-display font-bold text-lg',
                  b.id === active
                    ? 'bg-[#8B001D] border-[#8B001D] text-white'
                    : 'border-white/10 text-zinc-300 hover:border-white/30'
                )}
              >
                <span className="font-mono-tech text-xs mr-2 opacity-70">0{i + 1}</span>
                {b.title}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-[#14131a] border border-white/10 p-6 md:p-8 min-h-[240px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                role="tabpanel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="font-display font-bold text-2xl md:text-3xl text-white leading-tight">{current.lead}</p>
                <ul className="mt-6 space-y-3">
                  {current.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-zinc-300">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#E52E4D] shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

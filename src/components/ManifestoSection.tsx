import { useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import type { Course } from '../data/courses';

interface Direction {
  title: string;
  titles: string[];
  minPrice: number | null;
}

// Направления берутся из колонки «Направление» базы знаний (rag/*.xlsx), как и каталог курсов.
function groupDirections(courses: Course[]): Direction[] {
  const map = new Map<string, Direction>();
  for (const c of courses) {
    const d = map.get(c.direction) ?? { title: c.direction, titles: [], minPrice: null };
    d.titles.push(c.title);
    if (c.price != null) d.minPrice = d.minPrice == null ? c.price : Math.min(d.minPrice, c.price);
    map.set(c.direction, d);
  }
  return [...map.values()];
}

const plural = (n: number) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'курс';
  return m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? 'курса' : 'курсов';
};

const HIGHLIGHT = 'text-[#E52E4D]';

interface ManifestoSectionProps {
  courses: Course[] | null;
  error: boolean;
}

export function ManifestoSection({ courses, error }: ManifestoSectionProps) {
  const [selected, setSelected] = useState('');
  const directions = courses ? groupDirections(courses) : [];
  // Если выбранное направление исчезло из базы, активной становится первая карточка.
  const active = directions.some((d) => d.title === selected) ? selected : (directions[0]?.title ?? '');

  return (
    <>
      <section id="manifesto" className="relative w-full bg-[#070709] py-24 md:py-36 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-[#8B001D]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 mb-8 font-mono-tech text-sm">
            <span className="text-zinc-400">[About us]</span>
            <span className="px-3 py-1 rounded-full border border-white/10 text-zinc-300">Academy</span>
            <span className="px-3 py-1 rounded-full bg-[#8B001D] text-white">Since 2020</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="font-display font-bold uppercase text-3xl sm:text-5xl lg:text-[64px] leading-[1.05] tracking-tight text-white"
          >
            We transform <span className={HIGHLIGHT}>passion</span> into{' '}
            <span className={HIGHLIGHT}>expertise</span> people respect and{' '}
            <span className={HIGHLIGHT}>practical skills</span> that build careers
          </motion.h2>
        </div>
      </section>

      <section id="directions" className="w-full bg-[#070709] pb-24 md:pb-36">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <h3 className="font-display font-bold text-2xl md:text-4xl text-white">Направления</h3>
            <span className="font-mono-tech text-sm text-zinc-500">{directions.length} направлений</span>
          </div>

          {courses === null ? (
            <p className="text-zinc-400 py-16 text-center">
              {error ? 'Направления берутся из базы знаний, но RAG-сервис недоступен. Запустите npm run server.' : 'Загрузка направлений…'}
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {directions.map((d, i) => {
                const isActive = d.title === active;
                const n = d.titles.length;
                return (
                  <motion.button
                    key={d.title}
                    type="button"
                    onMouseEnter={() => setSelected(d.title)}
                    onFocus={() => setSelected(d.title)}
                    onClick={() => {
                      setSelected(d.title);
                      if (isActive) document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    whileHover={{ y: -8 }}
                    className={clsx(
                      'text-left rounded-2xl p-5 min-h-[280px] flex flex-col justify-between transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E52E4D]',
                      isActive
                        ? 'bg-[#8B001D] text-white sm:col-span-2 shadow-[0_20px_50px_-15px_rgba(139,0,29,0.7)]'
                        : 'bg-zinc-100 text-zinc-900 hover:bg-white'
                    )}
                  >
                    <div>
                      <span className={clsx('font-mono-tech text-xs', isActive ? 'text-white/70' : 'text-zinc-500')}>
                        {String(i + 1).padStart(2, '0')} / {n} {plural(n)}
                      </span>
                      <h4 className="font-display font-bold text-2xl mt-3 leading-tight break-words">{d.title}</h4>
                      {isActive && (
                        <p className="mt-4 text-sm leading-relaxed text-white/85">
                          {d.titles.slice(0, 4).join(', ')}
                          {n > 4 && ` и ещё ${n - 4}`}
                          {d.minPrice != null && `. От ${d.minPrice.toLocaleString('ru-RU')} сум за блок`}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                      Learn more <ArrowUpRight size={16} weight="bold" />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

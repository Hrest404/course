import { useEffect, useState } from 'react';
import { Clock, ListBullets, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'motion/react';
import { clsx } from 'clsx';
import type { Course } from '../data/courses';

const ALL = 'Все';

const money = (n: number | null) => (n == null ? 'не указана' : `${n.toLocaleString('ru-RU')} сум`);

interface FilterRowProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

function FilterRow({ label, options, value, onChange }: FilterRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono-tech text-xs text-zinc-500 w-24 shrink-0">{label}</span>
      {[ALL, ...options].map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={clsx(
            'px-3 py-1.5 rounded-full text-sm border transition-colors',
            value === o ? 'bg-[#8B001D] border-[#8B001D] text-white' : 'border-white/10 text-zinc-300 hover:border-white/30'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function SyllabusModal({ course, onClose }: { course: Course; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const facts = [
    course.age != null && `от ${course.age} лет`,
    course.months != null && `${course.months} мес.`,
    course.lessons != null && `${course.lessons} занятий`,
    course.format,
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={course.title}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-glow w-full max-w-2xl max-h-[88dvh] overflow-y-auto rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-mono-tech text-xs text-[#E52E4D]">{course.direction}</span>
            <h3 className="font-display font-bold text-2xl md:text-3xl text-white mt-1">{course.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="p-2 rounded-full hover:bg-white/10 text-zinc-300">
            <X size={20} />
          </button>
        </div>

        <p className="mt-3 text-sm text-zinc-400">{facts.join(' · ')}</p>

        {course.program.length > 0 && (
          <ol className="mt-6 space-y-2">
            {course.program.map((line, i) => (
              <li key={i} className="rounded-xl border border-white/10 p-3 text-sm text-zinc-200">
                {line}
              </li>
            ))}
          </ol>
        )}

        {course.teachers.length > 0 && (
          <p className="mt-6 text-sm text-zinc-300">
            <span className="font-mono-tech text-xs text-zinc-500">Преподаватели: </span>
            {course.teachers.join(', ')}
          </p>
        )}

        <div className="mt-6 rounded-xl bg-[#8B001D]/30 border border-[#8B001D] p-4 text-sm text-white space-y-1">
          <div>Standard: {money(course.price)} за блок (≈ месяц)</div>
          {course.pricePremium != null && <div>Premium: {money(course.pricePremium)} за блок</div>}
          {course.installment && <div className="text-white/80">Рассрочка: {course.installment}</div>}
          {course.salary != null && <div className="text-white/80">Зарплата выпускников: {money(course.salary)}</div>}
        </div>

        {course.url && (
          <div className="mt-6 flex justify-end">
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-[#8B001D] hover:bg-[#A5102A] text-white font-semibold text-sm transition-colors"
            >
              Страница курса
            </a>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

interface CourseCatalogProps {
  courses: Course[] | null;
  error: boolean;
}

export function CourseCatalog({ courses, error }: CourseCatalogProps) {
  const [direction, setDirection] = useState(ALL);
  const [format, setFormat] = useState(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const all = courses ?? [];
  const directions = [...new Set(all.map((c) => c.direction))];
  const formats = [...new Set(all.map((c) => c.format))];
  const visible = all.filter((c) => (direction === ALL || c.direction === direction) && (format === ALL || c.format === format));
  const selected = all.find((c) => c.id === selectedId) ?? null;

  return (
    <section id="courses" className="w-full bg-[#070709] pb-24 md:pb-36">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <h3 className="font-display font-bold text-2xl md:text-4xl text-white">Каталог курсов</h3>
          <span className="font-mono-tech text-sm text-zinc-500">{visible.length} из {all.length}</span>
        </div>

        {courses === null ? (
          <p className="text-zinc-400 py-16 text-center">
            {error ? 'Каталог берётся из базы знаний, но RAG-сервис недоступен. Запустите npm run server.' : 'Загрузка курсов…'}
          </p>
        ) : (
          <>
            <div className="space-y-3 mb-10">
              <FilterRow label="Направление" options={directions} value={direction} onChange={setDirection} />
              <FilterRow label="Формат" options={formats} value={format} onChange={setFormat} />
            </div>

            {visible.length === 0 ? (
              <p className="text-zinc-400 py-16 text-center">По выбранным фильтрам курсов нет. Попробуйте изменить условия.</p>
            ) : (
              <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {visible.map((c) => (
                    <motion.button
                      layout
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="text-left rounded-2xl bg-[#14131a] border border-white/10 hover:border-[#8B001D] p-5 flex flex-col gap-4 focus-visible:outline-2 focus-visible:outline-[#E52E4D]"
                    >
                      <div>
                        <span className="font-mono-tech text-xs text-[#E52E4D]">{c.direction}</span>
                        <h4 className="font-display font-bold text-xl text-white mt-1">{c.title}</h4>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
                        {c.months != null && <span className="inline-flex items-center gap-1"><Clock size={14} />{c.months} мес.</span>}
                        {c.lessons != null && <span className="inline-flex items-center gap-1"><ListBullets size={14} />{c.lessons} занятий</span>}
                        {c.age != null && <span>от {c.age} лет</span>}
                        <span>{c.format}</span>
                      </div>
                      {c.teachers.length > 0 && (
                        <p className="text-xs text-zinc-500">{c.teachers.slice(0, 2).join(', ')}{c.teachers.length > 2 && ` +${c.teachers.length - 2}`}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="font-display font-bold text-lg text-white">{c.price != null ? `${c.price.toLocaleString('ru-RU')} сум` : '—'}</span>
                        <span className="text-sm text-zinc-400">Подробнее →</span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && <SyllabusModal course={selected} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>
    </section>
  );
}

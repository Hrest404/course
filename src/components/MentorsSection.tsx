import { motion } from 'motion/react';

// Placeholder-данные для макета: имена и компании вымышленные.
const MENTORS = [
  { name: 'Алина Воронова', role: 'Art Director', company: 'Studio North', direction: 'Brand Identity', years: 12 },
  { name: 'Марат Каримов', role: 'Lead Product Designer', company: 'Pixel Labs', direction: 'UI/UX Design', years: 9 },
  { name: 'Дарья Левина', role: 'Motion Director', company: 'Frame Works', direction: 'Motion Design', years: 8 },
  { name: 'Игорь Седов', role: 'Head of Growth', company: 'Orbit Digital', direction: 'Digital Strategy', years: 10 },
  { name: 'Тимур Ахмедов', role: 'ML Engineer', company: 'Neural Craft', direction: 'AI Engineering', years: 7 },
];

const initials = (name: string) => name.split(' ').map((w) => w[0]).join('');

export function MentorsSection() {
  return (
    <section id="mentors" className="w-full bg-[#070709] pb-24 md:pb-36">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h3 className="font-display font-bold text-2xl md:text-4xl text-white">Менторы</h3>
          <span className="font-mono-tech text-sm text-zinc-400">практики индустрии</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MENTORS.map((m, i) => (
            <motion.article
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl bg-[#14131a] border border-white/10 hover:border-[#8B001D] overflow-hidden transition-colors"
            >
              <div className="aspect-[4/5] bg-gradient-to-b from-[#8B001D]/50 to-[#0e0d12] flex items-center justify-center">
                <span className="font-display font-black text-6xl text-white/90 tracking-tight">{initials(m.name)}</span>
              </div>
              <div className="p-4">
                <span className="inline-block px-2.5 py-1 rounded-full bg-white/5 text-xs text-zinc-300 font-mono-tech">
                  {m.company}
                </span>
                <h4 className="font-display font-bold text-lg text-white mt-3">{m.name}</h4>
                <p className="text-sm text-zinc-400">{m.role}</p>
                <p className="text-xs text-[#E52E4D] mt-2 font-mono-tech">
                  {m.direction} · {m.years} лет опыта
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ArrowUpRight, ArrowDownRight, Plus, Sparkle } from '@phosphor-icons/react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onExploreClick?: () => void;
  onOpenAiTutor?: () => void;
}

export function HeroSection({ onExploreClick, onOpenAiTutor }: HeroSectionProps) {
  return (
    <section id="hero" className="relative min-h-[92dvh] w-full flex items-center justify-center overflow-hidden bg-[#070709] select-none pt-4 pb-16">
      {/* Background Volumetric Crimson Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] hero-crimson-glow rounded-full blur-[80px] opacity-75" />
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-[#8B001D]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-[#50000e]/25 rounded-full blur-[120px]" />
      </div>

      {/* Atmospheric Grid Crosshairs like on reference */}
      <div className="absolute top-16 left-12 text-zinc-700/60 font-mono text-sm hidden lg:block">
        <Plus size={16} />
      </div>
      <div className="absolute top-1/3 right-16 text-zinc-700/60 font-mono text-sm hidden lg:block">
        <Plus size={20} className="text-[#8B001D]/50" />
      </div>
      <div className="absolute bottom-24 left-1/4 text-zinc-700/60 font-mono text-sm hidden lg:block">
        <Plus size={16} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[780px]">
        
        {/* Layer 1: Massive Background Headline 'EMBE' */}
        <div className="absolute top-6 md:top-10 w-full text-center pointer-events-none z-0">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display font-black text-[min(230px,18vw)] leading-none tracking-[-0.05em] text-white/90 uppercase inline-block scale-y-105"
          >
            EMBE
          </motion.h1>
        </div>

        {/* Layer 2: Central Hero Character (Person in Glasses with Open Book - Frameless Cutout) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-[700px] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Direct frameless cutout with neural alpha matting, solid hair, zero borders */}
            <div className="relative flex items-center justify-center">
              <img
                src="/assets/hero_scholar_cutout.png?v=2"
                alt="Академический наставник в очках с книгой"
                className="w-[380px] sm:w-[500px] md:w-[600px] lg:w-[670px] h-auto object-contain select-none drop-shadow-[0_20px_50px_rgba(139,0,29,0.35)]"
              />
            </div>

            {/* Subtle EST badge below character chest */}
            <div className="relative -mt-6 z-30 px-3.5 py-1 rounded-full bg-[#0e0d13]/90 border border-white/10 text-[10px] font-mono-tech tracking-widest text-zinc-400 uppercase shadow-lg pointer-events-auto">
              EST. 2026 • AI-READY
            </div>
          </motion.div>
        </div>

        {/* Layer 3: Massive Overlapping Crimson Typography 'ACADEMY' */}
        <div className="absolute bottom-16 md:bottom-20 w-full text-center pointer-events-none z-20">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="font-display font-black text-[15vw] md:text-[150px] lg:text-[200px] leading-none tracking-[-0.04em] text-[#8B001D] uppercase drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] scale-y-105"
          >
            ACADEMY
          </motion.h2>
        </div>

        {/* Layer 4: Floating Interactive Widgets (Left and Right) */}
        
        {/* LEFT COLUMN WIDGETS */}
        <div className="w-full lg:absolute lg:inset-x-8 lg:bottom-12 z-30 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 pointer-events-none mt-8 lg:mt-0">
          
          {/* Left stats & CTA */}
          <div className="flex flex-col gap-4 items-center sm:items-start pointer-events-auto">
            {/* Stat Box 1: 50+ */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-panel px-6 py-4 rounded-xl shadow-2xl min-w-[190px] hover:border-white/20 transition-colors"
            >
              <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">50+</div>
              <div className="text-xs font-medium text-zinc-400 tracking-wide mt-0.5">Курсов и программ</div>
            </motion.div>

            {/* Stat Box 2: 200M+ */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="glass-panel px-6 py-4 rounded-xl shadow-2xl min-w-[190px] hover:border-white/20 transition-colors"
            >
              <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">200M+</div>
              <div className="text-xs font-medium text-zinc-400 tracking-wide mt-0.5">Минут практики</div>
            </motion.div>

            {/* CTA Button: Discover More */}
            <motion.button
              onClick={onExploreClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 flex items-center gap-3 pl-5 pr-2 py-2 rounded-full bg-white text-zinc-950 font-extrabold text-sm tracking-wide shadow-[0_10px_25px_rgba(255,255,255,0.15)] hover:bg-zinc-100 transition-all cursor-pointer group"
            >
              <span>Подобрать курс</span>
              <div className="w-9 h-9 rounded-full bg-[#8B001D] text-white flex items-center justify-center group-hover:bg-[#A5102A] group-hover:rotate-45 transition-all">
                <ArrowUpRight size={18} weight="bold" />
              </div>
            </motion.button>
          </div>

          {/* RIGHT COLUMN WIDGET */}
          <div className="flex flex-col items-center lg:items-end pointer-events-auto">
            {/* Top right quote/statement card matching reference */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onClick={onOpenAiTutor}
              className="glass-panel p-5 rounded-xl max-w-[280px] sm:max-w-[320px] shadow-2xl hover:border-[#8B001D]/50 transition-all relative cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <ArrowDownRight size={20} className="text-zinc-400 group-hover:text-white transition-colors" />
                <span className="flex items-center gap-1 text-[10px] font-mono-tech tracking-widest text-[#FF4D6D] uppercase group-hover:underline">
                  <Sparkle size={12} weight="fill" />
                  RAG KNOWLEDGE
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-300 font-medium group-hover:text-white transition-colors">
                Где академическая глубина объединяется с практикой индустрии и персональным AI-тьютором на базе RAG.
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};

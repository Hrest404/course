import { useState } from 'react';
import { MagnifyingGlass, User, PhoneCall, Sparkle, List, X } from '@phosphor-icons/react';

interface NavbarProps {
  onOpenAiTutor?: () => void;
}

export function Navbar({ onOpenAiTutor }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#070709]/80 border-b border-white/[0.06] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Icon & Name */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B001D] to-[#50000e] border border-[#ff3355]/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,0,29,0.5)] group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-white text-lg tracking-wider">E</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-wider text-white text-base leading-none">
                EMBE<span className="text-[#D11A38]">.</span>
              </span>
              <span className="text-[10px] uppercase font-mono-tech tracking-widest text-zinc-500">ACADEMY</span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation links in pill container */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121117]/90 border border-white/10 rounded-full px-5 py-1.5 shadow-inner">
          <a
            href="#hero"
            className="px-4 py-1.5 text-xs font-semibold tracking-wider text-white hover:text-[#E52E4D] transition-colors uppercase"
          >
            Главная
          </a>
          <a
            href="#manifesto"
            className="px-4 py-1.5 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors uppercase"
          >
            О нас
          </a>
          <a
            href="#directions"
            className="px-4 py-1.5 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors uppercase"
          >
            Направления
          </a>
          <a
            href="#courses"
            className="px-4 py-1.5 text-xs font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors uppercase"
          >
            Курсы
          </a>
          <button
            onClick={onOpenAiTutor}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider text-[#FF4D6D] bg-[#8B001D]/20 border border-[#8B001D]/40 rounded-full hover:bg-[#8B001D]/40 transition-colors uppercase cursor-pointer"
          >
            <Sparkle size={13} weight="fill" className="text-[#FF4D6D] animate-pulse" />
            AI Тьютор (RAG)
          </button>
        </nav>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Поиск"
            className="w-10 h-10 rounded-full bg-[#131218] border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-[#8B001D] transition-all"
          >
            <MagnifyingGlass size={17} weight="bold" />
          </button>
          
          <button
            aria-label="Личный кабинет"
            className="hidden sm:flex w-10 h-10 rounded-full bg-[#131218] border border-white/10 items-center justify-center text-zinc-300 hover:text-white hover:border-[#8B001D] transition-all"
          >
            <User size={17} weight="bold" />
          </button>

          <a
            href="#courses"
            className="hidden sm:flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white text-zinc-950 font-bold text-xs tracking-wider uppercase hover:bg-zinc-200 transition-all shadow-md group"
          >
            <span>Начать</span>
            <div className="w-7 h-7 rounded-full bg-[#8B001D] flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <PhoneCall size={13} weight="bold" />
            </div>
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-[#131218] border border-white/10 flex items-center justify-center text-zinc-200"
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0d0d12] px-6 py-5 flex flex-col gap-4">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-white uppercase tracking-wider"
          >
            Главная
          </a>
          <a
            href="#manifesto"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-zinc-400 hover:text-white uppercase tracking-wider"
          >
            О нас
          </a>
          <a
            href="#directions"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-zinc-400 hover:text-white uppercase tracking-wider"
          >
            Направления
          </a>
          <a
            href="#courses"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sm font-semibold text-zinc-400 hover:text-white uppercase tracking-wider"
          >
            Курсы
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAiTutor?.();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#8B001D]/30 border border-[#8B001D] text-white text-sm font-bold uppercase tracking-wider"
          >
            <Sparkle size={16} weight="fill" className="text-[#FF4D6D]" />
            AI Тьютор по базе RAG
          </button>
        </div>
      )}
    </header>
  );
};

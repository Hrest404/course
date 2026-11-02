import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';

export default function App() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleExplore = () => {
    const el = document.getElementById('manifesto') || document.getElementById('directions');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenAiTutor = () => {
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-[#8B001D] selection:text-white">
      <Navbar onOpenAiTutor={handleOpenAiTutor} />
      
      <main className="flex-1 w-full flex flex-col items-center">
        <HeroSection onExploreClick={handleExplore} onOpenAiTutor={handleOpenAiTutor} />
      </main>

      {/* Placeholder info toast when clicking AI in Stage 2 */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel-glow max-w-md w-full p-6 rounded-2xl relative">
            <h3 className="font-display font-bold text-xl text-white mb-2">
              AI-тьютор (RAG Knowledge Engine)
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Модуль RAG будет интегрирован на <strong>Этапе 5</strong> плана. Он будет сканировать локальную директорию <code className="text-[#FF4D6D] bg-white/5 px-1 py-0.5 rounded">rag/</code> для персональных консультаций студентов.
            </p>
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#8B001D] hover:bg-[#A5102A] text-white font-bold text-sm transition-all"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

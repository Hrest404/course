import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ManifestoSection } from './components/ManifestoSection';
import { CourseCatalog } from './components/CourseCatalog';
import { MentorsSection } from './components/MentorsSection';
import { BenefitsSection } from './components/BenefitsSection';
import { Footer } from './components/Footer';
import { AiTutorDrawer } from './components/AiTutorDrawer';
import { useCourses } from './hooks/useCourses';

export default function App() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { courses, error } = useCourses();

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
        <ManifestoSection courses={courses} error={error} />
        <CourseCatalog courses={courses} error={error} />
        <MentorsSection />
        <BenefitsSection />
      </main>
      <Footer />

      <AiTutorDrawer open={isAiModalOpen} onOpenChange={setIsAiModalOpen} />
    </div>
  );
}

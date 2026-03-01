import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/appStore';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CursorSpotlight } from '@/components/CursorSpotlight';
import { Navigation } from '@/components/Navigation';
import { LoginSection } from '@/sections/LoginSection';
import { AvatarGallery } from '@/sections/AvatarGallery';
import { ScriptInput } from '@/sections/ScriptInput';
import { HistoryGrid } from '@/sections/HistoryGrid';
import { CreditsSection } from '@/sections/CreditsSection';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  const { isAuthenticated, currentView } = useAppStore();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scroll to top on view change
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginSection />;
      case 'avatars':
        return <AvatarGallery />;
      case 'script':
        return <ScriptInput />;
      case 'history':
        return <HistoryGrid />;
      case 'credits':
        return <CreditsSection />;
      default:
        return <LoginSection />;
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Background Effects */}
      <ParticleBackground />
      <CursorSpotlight />
      
      {/* Navigation */}
      {isAuthenticated && <Navigation />}
      
      {/* Main Content */}
      <main 
        ref={mainRef}
        className="relative z-10 min-h-screen overflow-y-auto overflow-x-hidden"
      >
        {renderCurrentView()}
      </main>
      
      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.98)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: '#111827',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }
        }}
      />
    </div>
  );
}

export default App;

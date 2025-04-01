import React, { useState } from 'react';
import MetalCalculator from './components/calculator/MetalCalculator';
import ProjectsView from './components/projects/ProjectsView';
import LanguageSelector from './components/common/LanguageSelector';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { theme } from './theme';

const AppContent = () => {
  const [activeView, setActiveView] = useState('calculator');
  const { t } = useLanguage();

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      <nav className="flex-none" style={{ backgroundColor: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex h-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveView('calculator')}
                className={`px-3 sm:px-4 h-full transition-colors relative whitespace-nowrap ${
                  activeView === 'calculator' ? 'font-medium' : ''
                }`}
                style={{ 
                  color: activeView === 'calculator' ? theme.colors.primary : theme.colors.textLight,
                }}
              >
                {t('navCalculator')}
                {activeView === 'calculator' && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveView('projects')}
                className={`px-3 sm:px-4 h-full transition-colors relative whitespace-nowrap ${
                  activeView === 'projects' ? 'font-medium' : ''
                }`}
                style={{ 
                  color: activeView === 'projects' ? theme.colors.primary : theme.colors.textLight,
                }}
              >
                {t('navProjects')}
                {activeView === 'projects' && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-0.5"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
              </button>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        {activeView === 'calculator' ? <MetalCalculator /> : <ProjectsView />}
      </main>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
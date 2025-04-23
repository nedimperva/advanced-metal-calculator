import React, { useState, useEffect } from 'react';
import MetalCalculator from './components/calculator/MetalCalculator';
import ProjectsView from './components/projects/ProjectsView';
import ProductsView from './components/product/ProductsView';
import LanguageSelector from './components/common/LanguageSelector';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAUpdateNotification from './components/PWAUpdateNotification';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { theme } from './theme';
import logo from './assets/logo.svg';

const AppContent = () => {
  const [activeView, setActiveView] = useState('calculator');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { t } = useLanguage();

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-menu-container')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
      <nav className="flex-none shadow-md" style={{ backgroundColor: theme.colors.surface }}>
        <div className="container mx-auto px-2 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* App Logo - always on the left for all screen sizes */}
            <div className="flex items-center">
              <div className="flex items-center justify-center mr-3">
                <img src={logo} alt="Metal Calculator Logo" className="h-12 w-12" />
              </div>
              <span className="hidden md:block ml-1 font-semibold" style={{ color: theme.colors.primary }}>
                {t('appTitle')}
              </span>
            </div>

            {/* Tabs - in the center */}
            <div className="flex h-full space-x-1 sm:space-x-4">
              <button
                onClick={() => setActiveView('calculator')}
                className={`px-4 sm:px-6 h-full transition-all duration-300 relative flex items-center rounded-t-lg ${
                  activeView === 'calculator' ? 'font-medium' : ''
                }`}
                style={{ 
                  color: activeView === 'calculator' ? theme.colors.primary : theme.colors.textLight,
                  backgroundColor: activeView === 'calculator' ? `${theme.colors.background}` : 'transparent',
                  transform: activeView === 'calculator' ? 'translateY(0)' : 'translateY(2px)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm0 2h8v2H6V4zm0 4h2v2H6V8zm0 4h2v2H6v-2zm4-4h4v2h-4V8zm0 4h4v2h-4v-2z" clipRule="evenodd" />
                </svg>
                <span>{t('navCalculator')}</span>
                {activeView === 'calculator' && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 rounded-t"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveView('projects')}
                className={`px-4 sm:px-6 h-full transition-all duration-300 relative flex items-center rounded-t-lg ${
                  activeView === 'projects' ? 'font-medium' : ''
                }`}
                style={{ 
                  color: activeView === 'projects' ? theme.colors.primary : theme.colors.textLight,
                  backgroundColor: activeView === 'projects' ? `${theme.colors.background}` : 'transparent',
                  transform: activeView === 'projects' ? 'translateY(0)' : 'translateY(2px)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <span>{t('navProjects')}</span>
                {activeView === 'projects' && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 rounded-t"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveView('products')}
                className={`px-4 sm:px-6 h-full transition-all duration-300 relative flex items-center rounded-t-lg ${
                  activeView === 'products' ? 'font-medium' : ''
                }`}
                style={{ 
                  color: activeView === 'products' ? theme.colors.primary : theme.colors.textLight,
                  backgroundColor: activeView === 'products' ? `${theme.colors.background}` : 'transparent',
                  transform: activeView === 'products' ? 'translateY(0)' : 'translateY(2px)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
                <span>{t('navProducts')}</span>
                {activeView === 'products' && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 rounded-t"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                )}
              </button>
            </div>

            {/* Language Selector - on the right */}
            <div className="flex items-center">
              {/* Language selector for desktop */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Language selector for mobile */}
              <div className="sm:hidden language-menu-container relative">
                <button 
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: showLanguageMenu ? `${theme.colors.primary}20` : 'transparent' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={theme.colors.primary}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10" style={{ backgroundColor: theme.colors.surface }}>
                    <div className="p-2">
                      <LanguageSelector />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        {activeView === 'calculator' ? <MetalCalculator /> : 
         activeView === 'projects' ? <ProjectsView /> : 
         <ProductsView />}
      </main>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* PWA Update Notification */}
      <PWAUpdateNotification />
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
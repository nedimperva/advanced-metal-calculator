import React, { useState, useEffect } from 'react';
import { isPWAInstalled } from '../registerSW';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../theme';

const PWAInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already installed as PWA
    setIsInstalled(isPWAInstalled());

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      // Show the install button
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;

    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setInstallPromptEvent(null);
    });
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-11/12 max-w-md p-4 rounded-lg shadow-lg z-50"
         style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, border: '1px solid' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 p-2 rounded-full" style={{ backgroundColor: theme.colors.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium" style={{ color: theme.colors.text }}>{t('installApp') || 'Install App'}</h3>
            <p className="text-sm" style={{ color: theme.colors.textLight }}>{t('addToHomeScreen') || 'Add to your home screen for easy access'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowPrompt(false)} 
            className="p-2 rounded-md text-sm"
            style={{ color: theme.colors.textLight }}
          >
            {t('later') || 'Later'}
          </button>
          <button 
            onClick={handleInstallClick} 
            className="p-2 rounded-md text-sm"
            style={{ backgroundColor: theme.colors.primary, color: theme.colors.textOnPrimary }}
          >
            {t('install') || 'Install'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

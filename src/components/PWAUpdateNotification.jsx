import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../theme';

const PWAUpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [updateAccepted, setUpdateAccepted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Listen for service worker update events
    const onUpdateFound = (registration) => {
      const installingWorker = registration.installing;
      
      if (installingWorker) {
        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available and will be used when all tabs for this page are closed
            console.log('New version available!');
            setUpdateAvailable(true);
            setWaitingWorker(registration.waiting);
          }
        });
      }
    };

    // Register event listener for new service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('updatefound', () => onUpdateFound(registration));
        
        // Check if there's already a waiting service worker
        if (registration.waiting) {
          setUpdateAvailable(true);
          setWaitingWorker(registration.waiting);
        }
      });
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const updateServiceWorker = () => {
    if (!waitingWorker) return;
    
    setUpdateAccepted(true);
    
    // Send skip-waiting message to the waiting service worker
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload the page to activate the new service worker
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!updateAvailable) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 p-4 z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
    >
      <div 
        className="mx-auto max-w-md rounded-lg shadow-lg p-4 flex flex-col"
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: '1px' }}
      >
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke={theme.colors.primary}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
            {t('updateAvailable')}
          </h3>
        </div>
        
        <p className="mb-4" style={{ color: theme.colors.textLight }}>
          {t('updateMessage')}
        </p>
        
        <div className="flex justify-end space-x-2">
          {!updateAccepted ? (
            <>
              <button
                className="px-3 py-1 rounded"
                style={{ color: theme.colors.textLight }}
                onClick={() => setUpdateAvailable(false)}
              >
                {t('updateLater')}
              </button>
              <button
                className="px-3 py-1 rounded"
                style={{ 
                  backgroundColor: theme.colors.primary,
                  color: '#fff'
                }}
                onClick={updateServiceWorker}
              >
                {t('updateNow')}
              </button>
            </>
          ) : (
            <div className="flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('updating')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;

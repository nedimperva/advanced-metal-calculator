// Register service worker for PWA functionality
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/advanced-metal-calculator/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for updates on page load
          registration.update();
          
          // Set up periodic checks for updates
          setInterval(() => {
            registration.update();
            console.log('Checking for service worker updates...');
          }, 60 * 60 * 1000); // Check every hour
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
};

// Check if the app is installed or in standalone mode
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

// Show install prompt for PWA
export const showInstallPrompt = (promptEvent, onInstalled, onCancelled) => {
  if (!promptEvent) return;

  // Show the install prompt
  promptEvent.prompt();
  
  // Wait for the user to respond to the prompt
  promptEvent.userChoice.then((choiceResult) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
      if (onInstalled) onInstalled();
    } else {
      console.log('User dismissed the install prompt');
      if (onCancelled) onCancelled();
    }
  });
};

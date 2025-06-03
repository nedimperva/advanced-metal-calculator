import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const MobileCalculatorLayout = ({ 
  children, 
  onOpenSaved = () => {}, 
  onOpenSettings = () => {},
  activeTab = 'calculate'
}) => {
  const { t } = useLanguage();
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigationItems = [
    {
      id: 'calculate',
      label: t('calculate'),
      icon: (
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      action: () => {} // This is the current view, no action needed
    },
    {
      id: 'saved',
      label: t('saved'),
      icon: (
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      action: onOpenSaved
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: (
        <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: onOpenSettings
    }
  ];

  return (
    <div 
      className="h-full w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Mobile Header - Fixed */}
      <div 
        className="flex-shrink-0 px-4 py-3 border-b"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            {t('metalCalculator')}
          </h1>
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <button
              className="p-2 rounded-lg"
              style={{ 
                backgroundColor: `${theme.colors.primary}20`,
                color: theme.colors.primary
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div 
        className="flex-shrink-0 border-t safe-area-bottom"
        style={{ 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => (
            <button 
              key={item.id}
              onClick={item.action}
              className="flex flex-col items-center py-2 px-4 rounded-lg transition-all touch-manipulation"
              style={{
                color: activeTab === item.id ? theme.colors.primary : theme.colors.textLight,
                backgroundColor: activeTab === item.id ? `${theme.colors.primary}15` : 'transparent'
              }}
            >
              <div style={{ color: activeTab === item.id ? theme.colors.primary : theme.colors.textLight }}>
                {item.icon}
              </div>
              <span 
                className="text-xs font-medium"
                style={{ color: activeTab === item.id ? theme.colors.primary : theme.colors.textLight }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCalculatorLayout; 
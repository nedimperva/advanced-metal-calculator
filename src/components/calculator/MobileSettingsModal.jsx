import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { theme } from '../../theme';

const MobileSettingsModal = ({ 
  isOpen, 
  onClose,
  onLanguageChange,
  currentLanguage,
  onThemeChange,
  currentTheme = 'dark'
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const settingsSections = [
    {
      id: 'appearance',
      title: t('appearance'),
      icon: '🎨',
      items: [
        {
          id: 'language',
          title: t('language'),
          type: 'select',
          value: currentLanguage,
          options: languages,
          onChange: onLanguageChange
        },
        {
          id: 'theme',
          title: t('theme'),
          type: 'toggle',
          value: currentTheme === 'dark',
          onChange: (value) => onThemeChange(value ? 'dark' : 'light'),
          labels: { on: t('dark'), off: t('light') }
        }
      ]
    },
    {
      id: 'calculations',
      title: t('calculations'),
      icon: '⚙️',
      items: [
        {
          id: 'auto-save',
          title: t('autoSave'),
          subtitle: t('autoSaveDesc'),
          type: 'toggle',
          value: true,
          onChange: () => {}
        },
        {
          id: 'notifications',
          title: t('notifications'),
          subtitle: t('notificationsDesc'),
          type: 'toggle',
          value: true,
          onChange: () => {}
        }
      ]
    },
    {
      id: 'about',
      title: t('about'),
      icon: 'ℹ️',
      items: [
        {
          id: 'version',
          title: t('version'),
          subtitle: '1.0.0',
          type: 'info'
        },
        {
          id: 'support',
          title: t('support'),
          subtitle: t('supportDesc'),
          type: 'link',
          action: () => window.open('mailto:support@metalcalculator.com')
        }
      ]
    }
  ];

  const renderSettingItem = (item) => {
    switch (item.type) {
      case 'select':
        return (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: theme.colors.text }}>
                {item.title}
              </div>
              {item.subtitle && (
                <div className="text-sm" style={{ color: theme.colors.textLight }}>
                  {item.subtitle}
                </div>
              )}
            </div>
            <select
              value={item.value}
              onChange={(e) => item.onChange(e.target.value)}
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }}
            >
              {item.options.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.flag} {option.name}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: theme.colors.text }}>
                {item.title}
              </div>
              {item.subtitle && (
                <div className="text-sm" style={{ color: theme.colors.textLight }}>
                  {item.subtitle}
                </div>
              )}
            </div>
            <button
              onClick={() => item.onChange(!item.value)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                item.value ? 'bg-opacity-100' : 'bg-opacity-30'
              }`}
              style={{ 
                backgroundColor: item.value ? theme.colors.primary : theme.colors.textLight
              }}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  item.value ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );
      
      case 'info':
        return (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium" style={{ color: theme.colors.text }}>
                {item.title}
              </div>
            </div>
            <div className="text-sm" style={{ color: theme.colors.textLight }}>
              {item.subtitle}
            </div>
          </div>
        );
      
      case 'link':
        return (
          <button
            onClick={item.action}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <div className="font-medium" style={{ color: theme.colors.text }}>
                {item.title}
              </div>
              {item.subtitle && (
                <div className="text-sm" style={{ color: theme.colors.textLight }}>
                  {item.subtitle}
                </div>
              )}
            </div>
            <svg className="w-5 h-5" style={{ color: theme.colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-h-[85vh] rounded-t-2xl overflow-hidden"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <h2 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${theme.colors.textLight}20`,
              color: theme.colors.textLight
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {settingsSections.map((section) => (
            <div key={section.id} className="p-4 border-b last:border-b-0" style={{ borderColor: theme.colors.border }}>
              {/* Section Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${theme.colors.primary}20` }}
                >
                  {section.icon}
                </div>
                <h3 className="font-medium" style={{ color: theme.colors.text }}>
                  {section.title}
                </h3>
              </div>

              {/* Section Items */}
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.id}>
                    {renderSettingItem(item)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
          <div className="text-center">
            <p className="text-sm" style={{ color: theme.colors.textLight }}>
              {t('madeWith')} ❤️ {t('forMetalWorkers')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSettingsModal; 
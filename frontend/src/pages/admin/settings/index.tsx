import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, Languages, Settings } from 'lucide-react';
import './Settings.scss';

export default function CoachSettings() {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'en', name: t('language.en', { defaultValue: 'English' }), label: 'English', flag: '🇬🇧' },
    { code: 'fr', name: t('language.fr', { defaultValue: 'Français' }), label: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: t('language.ar', { defaultValue: 'العربية' }), label: 'العربية', flag: '🇸🇦' },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  // 🔥 Proper global RTL handling
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const getCurrentLanguageLabel = () => {
    const currentLang = languages.find(lang => lang.code === i18n.language);
    return currentLang ? currentLang.label : t('settings.language');
  };

  const isRTL = i18n.language === 'ar';

  return (
    <div className={`settings-page animate-fadeIn ${isRTL ? 'rtl' : ''}`}>
      <div className="settings-content">
        <div className="settings-section animate-slideUp">
          <div className="section-header">
            <div className="section-icon">
              <Languages size={20} />
            </div>

            <h2>{t('settings.title')}</h2>

            <span className="current-language-badge">
              {getCurrentLanguageLabel()}
            </span>
          </div>

          <div className="language-options">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                <span className="language-flag">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>

                {i18n.language === lang.code && (
                  <Check size={18} className="check-icon" />
                )}

                <ChevronRight size={16} className="chevron-icon" />
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section coming-soon animate-slideUp">
          <div className="section-header">
            <div className="section-icon">
              <Settings size={20} />
            </div>
            <h2>{t('settings.additional_settings')}</h2>
          </div>

          <p className="settings-note">
            {t('settings.coming_soon')}
          </p>
        </div>
      </div>
    </div>
  );
}


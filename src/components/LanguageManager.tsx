import React, { useState } from 'react';
import { useTranslation } from '../i18n';
import { translateUI } from '../services/geminiService';
import { AddIcon } from '../constants';
import { defaultLanguages } from '../i18n';

interface LanguageManagerProps {
  apiKey: string | null;
}

const LanguageManager: React.FC<LanguageManagerProps> = ({ apiKey }) => {
  const { t, addLanguage, deleteLanguage, availableLanguages } = useTranslation();
  const [newLangCode, setNewLangCode] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddLanguage = async () => {
    const code = newLangCode.trim().toLowerCase();
    if (!code) {
      setError(t("lang_manager_error_empty"));
      return;
    }
    if (!apiKey) {
      setError(t("lang_manager_error_no_key"));
      return;
    }

    setIsTranslating(true);
    setError(null);
    setSuccess(null);

    try {
      const baseTranslations = await import('../locales/en.json');
      // Pass the code as the target language for translation
      const translatedJson = await translateUI(apiKey, code, JSON.stringify(baseTranslations.default), t);

      // Use the code for both the name and the code
      addLanguage(code, code, translatedJson);

      setSuccess(t('lang_manager_success', { langName: code }));
      setNewLangCode('');
    } catch (err: any) {
      setError(err.message || t("lang_manager_error_generic"));
    } finally {
      setIsTranslating(false);
    }
  };

  const handleDeleteLanguage = (code: string, name: string) => {
    if (window.confirm(t('lang_manager_delete_confirm', { langName: name }))) {
      deleteLanguage(code);
    }
  };

  const customLanguages = Object.entries(availableLanguages).filter(
    ([code]) => !Object.keys(defaultLanguages).includes(code)
  );

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('lang_manager_title')}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {t('lang_manager_info')}
      </p>
      <div className="space-y-4">
        <div>
          <label htmlFor="langCode" className="block text-sm font-medium text-gray-700">{t('lang_manager_code_label')}</label>
          <input
            type="text"
            id="langCode"
            value={newLangCode}
            onChange={(e) => setNewLangCode(e.target.value)}
            placeholder={t('lang_manager_code_placeholder')}
            maxLength={5} // Allow for codes like 'en-US'
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isTranslating}
          />
        </div>
        <button
          onClick={handleAddLanguage}
          disabled={isTranslating || !apiKey}
          className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isTranslating ? (
            <div className="spinner w-5 h-5 border-t-white mr-2"></div>
          ) : (
            <AddIcon className="w-5 h-5 mr-2" />
          )}
          {isTranslating ? t('lang_manager_button_translating') : t('lang_manager_button_add')}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {success && <p className="text-sm text-green-600 mt-2">{success}</p>}

      {customLanguages.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('lang_manager_custom_languages_title')}</h3>
          <ul className="space-y-2">
            {customLanguages.map(([code, name]) => (
              <li key={code} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm font-medium text-gray-800">{name}</span>
                <button
                  onClick={() => handleDeleteLanguage(code, name)}
                  className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200"
                  aria-label={`Delete ${name}`}
                >
                  {t('lang_manager_delete_button')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageManager;
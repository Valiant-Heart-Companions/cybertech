'use client';

import { useLanguage } from '~/i18n/LanguageContext';
import { translations } from '~/i18n/translations';

export default function AboutPage() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t.about.title}</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-6">
            {t.about.intro}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.about.mission.title}</h2>
          <p className="text-gray-600 mb-6">
            {t.about.mission.content}
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.about.values.title}</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6">
            {t.about.values.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          
          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">{t.about.history.title}</h2>
          <p className="text-gray-600 mb-6">
            {t.about.history.content}
          </p>
        </div>
      </div>
    </div>
  );
} 
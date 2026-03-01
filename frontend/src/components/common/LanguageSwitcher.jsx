// src/components/layout/LanguageSwitcher.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
    const { lang, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all border border-gray-200"
            aria-label="Toggle language"
        >
            <span className="text-sm font-semibold">
                {lang === 'ar' ? 'EN' : 'عربي'}
            </span>
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-orange-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
                />
            </svg>
        </button>
    );
};

export default LanguageSwitcher;
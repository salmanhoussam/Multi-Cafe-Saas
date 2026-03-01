// src/components/layout/Header.jsx
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = ({ restaurant, showCart = false, onCartClick }) => {
    const { lang } = useLanguage();
    
    const restName = lang === 'ar' ? restaurant?.name_ar : restaurant?.name_en;
    
    // صورة الغلاف
    const coverImage = restaurant?.cover_image || restaurant?.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    
    // اللوجو
    const logoImage = restaurant?.image_url || 'https://placehold.co/100x100?text=Logo';

    return (
        <header className="relative h-64 bg-gray-200">
            {/* صورة الغلاف */}
            <img src={coverImage} className="w-full h-full object-cover" alt="cover" />
            
            {/* تدرج لوني داكن في الأسفل */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                {/* زر اللغة في الأعلى */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                    <LanguageSwitcher />
                </div>

                {/* المحتوى السفلي */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 flex items-end gap-4">
                    {/* اللوجو البارز */}
                    <img 
                        src={logoImage} 
                        className="w-24 h-24 rounded-3xl border-4 border-white bg-white shadow-xl object-cover" 
                        alt="logo" 
                    />
                    <div className="text-white mb-2">
                        <h1 className="text-3xl font-black drop-shadow-lg tracking-wide">{restName}</h1>
                        <p className="text-sm font-medium mt-1 drop-shadow-md flex items-center gap-1 opacity-90">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            {lang === 'ar' ? 'مفتوح الآن' : 'Open now'}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
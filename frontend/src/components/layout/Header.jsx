import React from 'react';

const Header = ({ restaurant, lang, t }) => {
    const restName = lang === 'ar' ? restaurant.name_ar : restaurant.name_en;
    const coverImage = restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';
    const logoImage = restaurant.image_url || 'https://placehold.co/100x100?text=Logo'; // يمكنك لاحقاً إضافة حقل خاص للوجو في الداتابيز

    return (
        <header className="relative h-64 bg-gray-200">
            {/* صورة الغلاف */}
            <img src={coverImage} className="w-full h-full object-cover" alt="cover" />
            
            {/* تدرج لوني داكن في الأسفل لتوضيح النصوص */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 pb-8">
                <div className="flex items-end gap-4 w-full translate-y-4">
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
                            {t('openNow')}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
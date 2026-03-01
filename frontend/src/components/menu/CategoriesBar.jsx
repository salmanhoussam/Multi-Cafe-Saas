import React from 'react';

const CategoriesBar = ({ categories, lang, activeCategory, onCategoryClick }) => {
    return (
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm overflow-x-auto hide-scrollbar flex px-4 gap-4 border-b border-gray-100 py-3">
            {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const catName = lang === 'ar' ? cat.name_ar : cat.name_en;

                return (
                    <button 
                        key={cat.id} 
                        onClick={() => onCategoryClick(cat.id)} 
                        className={`flex flex-col items-center min-w-[75px] transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}
                    >
                        <div className={`p-1 rounded-full mb-2 transition-colors ${isActive ? 'bg-orange-500' : 'bg-transparent'}`}>
                            <img 
                                src={cat.image_url || 'https://placehold.co/100x100?text=Cat'} 
                                className="w-14 h-14 rounded-full object-cover border-2 border-white bg-gray-50 shadow-sm" 
                                alt={catName} 
                            />
                        </div>
                        <span className={`text-xs font-bold transition-colors ${isActive ? 'text-orange-600' : 'text-gray-600'}`}>
                            {catName}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoriesBar;
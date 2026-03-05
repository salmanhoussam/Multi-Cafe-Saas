import React from 'react';
import MenuItemCard from './MenuItemCard';

const MenuSection = ({ category, items, lang, onAddToCart }) => {
    // اسم الفئة حسب اللغة
    const categoryName = lang === 'ar' ? category.name_ar : category.name_en;
    
    // فلترة الأصناف الخاصة بهذه الفئة
    const categoryItems = items.filter(item => item.category_id === category.id);

    // إذا كانت الفئة لا تحتوي على أصناف، لا نعرضها
    if (categoryItems.length === 0) {
        return null;
    }

    return (
        <div className="mb-8 scroll-mt-32" id={`category-${category.id}`}>
            {/* رأس الفئة مع صورة - بدون عرض العدد */}
            <div className="relative mb-4">
                {category.image_url && (
                    <div className="absolute inset-0 opacity-10 rounded-2xl overflow-hidden">
                        <img 
                            src={category.image_url} 
                            alt={categoryName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="relative z-10 flex items-center gap-3 p-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {categoryName}
                    </h2>
                    {/* <span className="bg-orange-100 text-orange-600 text-sm px-3 py-1 rounded-full">
                        {categoryItems.length} {lang === 'ar' ? 'صنف' : 'items'}
                    </span> */}
                </div>
            </div>

            {/* شبكة الأصناف */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map(item => (
                    <MenuItemCard 
                        key={item.id}
                        item={item}
                        lang={lang}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </div>
    );
};

export default MenuSection;
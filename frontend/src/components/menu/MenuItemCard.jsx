import React from 'react';

const MenuItemCard = ({ item, lang, onAddToCart }) => {
    // تحديد اللغة للاسم والوصف
    const name = lang === 'ar' ? item.name_ar : item.name_en;
    const desc = lang === 'ar' ? item.description_ar : item.description_en;

    return (
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center transition-all hover:shadow-md relative overflow-hidden group">
            
            {/* قسم النصوص */}
            <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-lg mb-1">{name}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                    {desc}
                </p>
                <div className="flex justify-between items-center">
                    <span className="font-black text-orange-600 text-lg">
                        {item.price} <span className="text-xs text-gray-400 font-normal ml-1">{item.currency}</span>
                    </span>
                </div>
            </div>

            {/* قسم الصورة وزر الإضافة */}
            <div className="relative">
                <img 
                    src={item.image_url || 'https://placehold.co/150'} 
                    className="w-28 h-28 object-cover rounded-2xl bg-gray-50 transition-transform duration-300 group-hover:scale-105 shadow-sm" 
                    alt={name} 
                />
                
                {/* زر الإضافة العائم فوق الصورة */}
                <button 
                    onClick={() => onAddToCart(item)} 
                    className="absolute -bottom-3 -left-3 bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform hover:bg-orange-600 border-2 border-white"
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>
            
        </div>
    );
};

export default MenuItemCard;
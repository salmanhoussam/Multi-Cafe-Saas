import React from 'react';
import { useMenuData } from '../hooks/useMenuData';
import { getMenuSlug } from '../utils/config';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';

const MenuPage = () => {
    // 1. استخراج السلوغ (إذا لم يجد سلوغ في الرابط، سيبحث عن مطعم اسمه arizona للتجربة)
    const slug = getMenuSlug() || 'arizona'; 
    
    // 2. جلب البيانات من الباك إند
    const { data, loading, error } = useMenuData(slug);
    
    // 3. استدعاء أدوات اللغة والسلة
    const { lang, t, toggleLanguage } = useLanguage();
    const { addToCart } = useCart();

    // حالات التحميل والخطأ
    if (loading) {
        return <div className="flex justify-center items-center h-screen font-bold text-xl text-orange-500">{t('loading')}</div>;
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center h-screen text-center p-4">
                <div>
                    <h2 className="text-xl font-bold">{t('restaurantNotFound')}</h2>
                    <p className="text-gray-500 mt-2">{t('checkLink')}</p>
                    <a href="/" className="mt-4 inline-block text-orange-600 font-bold">{t('backToHome')}</a>
                </div>
            </div>
        );
    }

    const { restaurant, categories, items } = data;
    const restName = lang === 'ar' ? restaurant.name_ar : restaurant.name_en;

    // دالة التمرير السلس للفئات (Scroll)
    const scrollToCategory = (catId) => {
        const el = document.getElementById(`cat-${catId}`);
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            {/* زر تغيير اللغة العائم */}
            <div className="fixed top-4 left-4 z-50">
                <button onClick={toggleLanguage} className="bg-white/90 backdrop-blur shadow-md px-4 py-2 rounded-full font-bold text-sm border border-gray-200">
                    <i className="fas fa-globe me-1"></i> <span>{lang === 'ar' ? 'EN' : 'AR'}</span>
                </button>
            </div>

            {/* الهيدر (صورة الغلاف، اللوجو، الاسم) */}
            <header className="relative h-56 bg-gray-200">
                <img src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'} className="w-full h-full object-cover" alt="cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                    <div className="flex items-center gap-4">
                        <img src={restaurant.image_url || 'https://placehold.co/100x100?text=Logo'} className="w-20 h-20 rounded-2xl border-2 border-white bg-white shadow-xl object-cover" alt="logo" />
                        <div className="text-white">
                            <h1 className="text-2xl font-bold drop-shadow-md">{restName}</h1>
                            <p className="text-sm opacity-100 font-semibold drop-shadow-md"><i className="fas fa-circle text-green-400 text-[10px] ml-1"></i> {t('openNow')}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* شريط الفئات (Categories Bar) */}
            <div className="sticky top-0 z-40 bg-white shadow-sm overflow-x-auto hide-scrollbar flex px-4 gap-6 border-b">
                {categories.map((cat, i) => (
                    <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className="flex flex-col items-center py-4 min-w-[70px] active:scale-95 transition-transform">
                        <img src={cat.image_url || 'https://placehold.co/100x100?text=Cat'} className={`w-12 h-12 rounded-full object-cover mb-2 border-2 ${i === 0 ? 'border-orange-500' : 'border-transparent'}`} alt="cat" />
                        <span className={`text-xs font-bold ${i === 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {lang === 'ar' ? cat.name_ar : cat.name_en}
                        </span>
                    </button>
                ))}
            </div>

            {/* قائمة الطعام (Menu Items) */}
            <main className="p-4 space-y-10" id="menu-content">
                {categories.map(cat => {
                    // تصفية العناصر التي تتبع لهذه الفئة فقط
                    const catItems = items.filter(i => i.category_id === cat.id);
                    if (catItems.length === 0) return null; // لا تعرض الفئة إذا كانت فارغة

                    return (
                        <section key={cat.id} id={`cat-${cat.id}`}>
                            <h3 className="font-bold text-xl mb-4 px-2 border-r-4 border-orange-500">
                                {lang === 'ar' ? cat.name_ar : cat.name_en}
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {catItems.map(item => (
                                    <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border flex gap-4 items-center transition-all hover:shadow-md">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800">{lang === 'ar' ? item.name_ar : item.name_en}</h4>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                                {lang === 'ar' ? item.description_ar : item.description_en}
                                            </p>
                                            <div className="mt-3 flex justify-between items-center">
                                                <span className="font-black text-orange-600">{item.price} {item.currency}</span>
                                                <button 
                                                    onClick={() => addToCart({
                                                        id: item.id, 
                                                        name: lang === 'ar' ? item.name_ar : item.name_en, 
                                                        price: item.price, 
                                                        currency: item.currency 
                                                    })} 
                                                    className="add-btn bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:bg-orange-600"
                                                >
                                                    <i className="fas fa-plus text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <img src={item.image_url || 'https://placehold.co/150'} className="w-24 h-24 object-cover rounded-xl bg-gray-50" alt="item" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </main>
        </div>
    );
};

export default MenuPage;
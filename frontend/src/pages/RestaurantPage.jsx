// src/pages/RestaurantPage.jsx (المعدل)
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useMenuData } from '../hooks/useMenuData';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import CategoriesBar from '../components/menu/CategoriesBar';
import MenuSection from '../components/menu/MenuSection';
import CartModal from '../components/common/CartModal';
import FloatingCart from '../components/layout/FloatingCart';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const RESERVED_SLUGS = ['login', 'dashboard', 'admin', 'api', 'assets'];

const RestaurantPage = () => {
    const { slug } = useParams();
    const { lang } = useLanguage();
    const { addToCart, cart } = useCart();
    const [activeCategory, setActiveCategory] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    if (RESERVED_SLUGS.includes(slug)) {
        return <Navigate to="/" />;
    }

    const { data: menu, loading, error } = useMenuData(slug);

    const scrollToCategory = (categoryId) => {
        setActiveCategory(categoryId);
        const element = document.getElementById(`category-${categoryId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل القائمة...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">عذراً</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!menu) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">عذراً</h1>
                    <p className="text-gray-600">المطعم غير موجود</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* زر اللغة في الأعلى (يظهر فوق كل شيء) */}
            <div className="fixed top-4 left-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* صورة الغلاف */}
            {menu.restaurant.cover_image && (
                <div className="w-full h-48 md:h-64 bg-cover bg-center relative" 
                     style={{ backgroundImage: `url(${menu.restaurant.cover_image})` }}>
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
            )}
            
            {/* شعار المطعم */}
            <div className="container mx-auto px-4 -mt-16 relative z-20">
                <div className="flex justify-center">
                    {menu.restaurant.image_url ? (
                        <img 
                            src={menu.restaurant.image_url} 
                            alt={menu.restaurant.name_ar}
                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-orange-600 flex items-center justify-center">
                            <span className="text-4xl text-white font-bold">
                                {menu.restaurant.name_ar?.charAt(0) || '?'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* معلومات المطعم */}
            <div className="container mx-auto px-4 py-6">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {lang === 'ar' ? menu.restaurant.name_ar : menu.restaurant.name_en}
                    </h1>
                    {/* تم إزالة عرض رقم الهاتف هنا */}
                </div>

                {/* شريط الفئات */}
                <CategoriesBar 
                    categories={menu.categories}
                    lang={lang}
                    activeCategory={activeCategory}
                    onCategoryClick={scrollToCategory}
                />

                {/* أقسام القائمة - الآن بعرض نصف الشاشة (max-w-2xl) ومتمركز */}
                <div className="mt-6 space-y-8 max-w-2xl mx-auto">
                    {menu.categories.map(category => (
                        <MenuSection 
                            key={category.id}
                            category={category}
                            items={menu.items}
                            lang={lang}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            </div>

            {/* أيقونة السلة العائمة */}
            {cart.length > 0 && (
                <FloatingCart 
                    itemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
                    onClick={() => setIsCartOpen(true)}
                    restaurantPhone={menu.restaurant.phone} // ✅ تمرير رقم الهاتف للسلة
                />
            )}

            {/* نافذة السلة */}
            <CartModal 
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                restaurantPhone={menu.restaurant.phone} // ✅ تمرير رقم الهاتف
            />
        </div>
    );
};

export default RestaurantPage;
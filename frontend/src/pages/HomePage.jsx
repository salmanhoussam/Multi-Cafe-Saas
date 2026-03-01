// src/pages/HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
const HomePage = () => {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
            {/* الهيدر مع زر اللغة */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold text-orange-600">
                            SALMAN<span className="text-gray-800">SAAS</span>
                        </h1>
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        {lang === 'ar' ? 'ارتقِ بأعمالك للمستقبل' : 'Elevate Your Business'}
                    </h1>
                    <p className="text-2xl text-orange-600 font-semibold mb-8">
                        {lang === 'ar' ? 'بأنظمة ذكية وسريعة' : 'With Smart & Fast Systems'}
                    </p>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {lang === 'ar' 
                            ? 'أنظمة سحابية متطورة لإدارة الحجوزات والقوائم الإلكترونية، صممت لتعكس فخامة علامتك التجارية.'
                            : 'Advanced cloud systems for managing reservations and electronic menus, designed to reflect the luxury of your brand.'}
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                        <div className="text-5xl mb-4 text-orange-500">📱</div>
                        <h3 className="text-xl font-bold mb-2">
                            {lang === 'ar' ? 'قوائم رقمية' : 'Digital Menus'}
                        </h3>
                        <p className="text-gray-600">
                            {lang === 'ar' 
                                ? 'قوائم طعام تفاعلية محدثة بشكل لحظي'
                                : 'Interactive food menus updated in real-time'}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                        <div className="text-5xl mb-4 text-orange-500">📊</div>
                        <h3 className="text-xl font-bold mb-2">
                            {lang === 'ar' ? 'لوحة تحكم' : 'Dashboard'}
                        </h3>
                        <p className="text-gray-600">
                            {lang === 'ar' 
                                ? 'إدارة كاملة للمطعم والفئات والأصناف'
                                : 'Complete restaurant management'}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                        <div className="text-5xl mb-4 text-orange-500">🛵</div>
                        <h3 className="text-xl font-bold mb-2">
                            {lang === 'ar' ? 'توصيل ذكي' : 'Smart Delivery'}
                        </h3>
                        <p className="text-gray-600">
                            {lang === 'ar' 
                                ? 'نظام توصيل متكامل (قريباً)'
                                : 'Integrated delivery system (coming soon)'}
                        </p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="text-center space-y-4">
                    <button
                        onClick={() => navigate('/arizona')}
                        className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition shadow-lg hover:shadow-xl inline-block"
                    >
                        {lang === 'ar' ? '👀 معاينة مطعم' : '👀 Preview Restaurant'}
                    </button>
                    <div className="text-gray-500">
                        {lang === 'ar' ? 'أو' : 'or'}
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white text-orange-600 border-2 border-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition inline-block"
                    >
                        {lang === 'ar' ? '🔐 دخول المديرين' : '🔐 Admin Login'}
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-16 text-gray-500">
                    <p>© 2024 SALMANSAAS - {lang === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
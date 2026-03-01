// src/pages/NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const NotFoundPage = () => {
    const navigate = useNavigate();
    const { t, lang } = useLanguage();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex flex-col items-center justify-center p-4 relative">
            
            {/* زر اللغة في الأعلى */}
            <div className="absolute top-4 left-4 z-10">
                <LanguageSwitcher />
            </div>

            {/* قسم الـ 404 الأساسي */}
            <div className="text-center mb-10">
                <h1 className="text-9xl font-extrabold text-orange-500 drop-shadow-md tracking-widest">
                    404
                </h1>
                <h2 className="text-3xl font-bold text-gray-800 mt-6">
                    {lang === 'ar' ? 'عذراً، ضللت الطريق!' : 'Oops! Lost Your Way?'}
                </h2>
                <p className="text-gray-600 mt-3 max-w-md mx-auto text-lg">
                    {lang === 'ar' 
                        ? 'الصفحة التي تبحث عنها غير موجودة، ربما تم نقلها أو أن الرابط غير صحيح.'
                        : 'The page you are looking for does not exist, it may have been moved or the URL is incorrect.'}
                </p>
            </div>

            {/* أزرار التنقل */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button
                    onClick={() => navigate('/')}
                    className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30"
                >
                    {lang === 'ar' ? '🏠 العودة للرئيسية' : '🏠 Back to Home'}
                </button>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                    {lang === 'ar' ? '→ الرجوع للخلف' : '← Go Back'}
                </button>
            </div>

            {/* قسم الترويج لتطبيق الدليفري القادم */}
            <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border-t-4 border-orange-500 text-center relative overflow-hidden transform transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                    {lang === 'ar' ? 'قريباً' : 'Coming Soon'}
                </div>
                
                <div className="text-5xl mb-4 animate-bounce">🛵</div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {lang === 'ar' ? 'تطبيق دليفري المنطقة' : 'Al MANTACA Delivery App'}
                </h3>
                
                <p className="text-gray-600 mb-5 leading-relaxed">
                    {lang === 'ar' 
                        ? 'نحن نعمل بشغف لتجهيز واجهة التوصيل الذكية الخاصة بنا. ستكون متاحة قريباً جداً لتسهيل طلباتكم وتوصيلها أينما كنتم!'
                        : 'We are passionately working on our smart delivery interface. It will be available very soon to facilitate your orders and deliver them wherever you are!'}
                </p>
                
                <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg text-sm font-mono inline-block border border-gray-200">
                    <span className="text-orange-500 font-bold">salmansaas.com</span>
                    {lang === 'ar' ? '/دليفري-المنطقة' : '/delivery-almantaca'}
                </div>
            </div>

        </div>
    );
};

export default NotFoundPage;
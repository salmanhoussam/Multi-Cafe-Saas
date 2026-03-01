// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';  // ✅ صحيح
const DashboardLayout = ({ children, restaurantName }) => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const location = useLocation();
    const { lang } = useLanguage(); // ✅ استخدام اللغة
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { name: lang === 'ar' ? 'الرئيسية' : 'Dashboard', path: `/dashboard/${slug}`, icon: '📊' },
        { name: lang === 'ar' ? 'إدارة الفئات' : 'Categories', path: `/dashboard/${slug}/categories`, icon: '📑' },
        { name: lang === 'ar' ? 'إدارة الأصناف' : 'Menu Items', path: `/dashboard/${slug}/items`, icon: '🍽️' },
    ];

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen flex bg-gray-50" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {/* زر اللغة في الأعلى */}
            <div className="fixed top-4 left-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* 📱 زر القائمة الجانبية للموبايل */}
            <button 
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 right-4 z-50 bg-orange-600 text-white p-3 rounded-lg shadow-lg"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* 📋 القائمة الجانبية (Sidebar) */}
            <aside className={`
                fixed lg:static inset-y-0 right-0 z-40
                transform transition-transform duration-300 ease-in-out
                w-64 bg-white shadow-xl flex flex-col
                ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}>
                {/* زر إغلاق القائمة على الموبايل */}
                <button 
                    onClick={toggleSidebar}
                    className="lg:hidden absolute top-4 left-4 text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 border-b border-gray-100 text-center">
                    <h2 className="text-2xl font-extrabold text-orange-600 tracking-wider">
                        SALMAN<span className="text-gray-800">SAAS</span>
                    </h2>
                </div>
                
                <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive 
                                    ? 'bg-orange-50 text-orange-600 font-bold border-r-4 border-orange-600' 
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                                }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={() => {
                            handleLogout();
                            setSidebarOpen(false);
                        }} 
                        className="w-full bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition font-bold flex items-center justify-center gap-2"
                    >
                        <span>🚪</span> {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                </div>
            </aside>

            {/* 📱 محتوى الصفحة الرئيسي */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* الشريط العلوي (Topbar) */}
                <header className="bg-white shadow-sm min-h-20 flex items-center justify-between px-4 lg:px-8 py-3 lg:py-0">
                    <div className="mr-12 lg:mr-0">
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-800">
                            {restaurantName || (lang === 'ar' ? 'جاري التحميل...' : 'Loading...')}
                        </h1>
                    </div>
                    <div className="bg-gray-100 px-3 py-1 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-mono text-gray-600 border border-gray-200">
                        <span className="hidden lg:inline">{lang === 'ar' ? 'معرف النظام: ' : 'System ID: '}</span>
                        <span className="font-bold text-orange-500">{slug}</span>
                    </div>
                </header>

                {/* المحتوى المتغير (Children) */}
                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    {children}
                </div>
            </main>

            {/* خلفية داكنة عند فتح القائمة على الموبايل */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
};

export default DashboardLayout;
// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useLanguage } from '../contexts/LanguageContext'; // ✅ إضافة useLanguage
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const LoginPage = () => {
    const [slug, setSlug] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t, lang } = useLanguage(); // ✅ استخدام الترجمة

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 📡 الاتصال بالباك أند (admin.salmansaas.com/api/v1/admin/auth/login)
            const data = await dashboardService.login(slug, password);
            
            // ✅ توجيه المدير إلى رابط الداشبورد الجديد مع الـ slug
            navigate(`/dashboard/${data.slug}`);
            
        } catch (err) {
            setError(err.message || (lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid login credentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-4 relative">
            
            {/* زر اللغة في الأعلى */}
            <div className="absolute top-4 left-4 z-10">
                <LanguageSwitcher />
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {lang === 'ar' ? 'لوحة تحكم إدارة المطاعم' : 'Restaurant Management Dashboard'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center text-sm border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {lang === 'ar' ? 'معرف المطعم (Slug)' : 'Restaurant Slug'}
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder={lang === 'ar' ? 'مثال: demo' : 'Example: demo'}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {lang === 'ar' ? 'كلمة المرور' : 'Password'}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 text-white font-bold rounded-lg transition-colors ${
                            loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                    >
                        {loading 
                            ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...')
                            : (lang === 'ar' ? 'دخول' : 'Login')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-orange-600 hover:underline text-sm font-medium"
                    >
                        {lang === 'ar' ? '← العودة للصفحة الرئيسية' : '← Back to Home'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
// src/pages/DashboardPage.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLanguage } from '../contexts/LanguageContext'; // ✅ إضافة useLanguage
import DashboardLayout from '../components/layout/DashboardLayout';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { t, lang } = useLanguage(); // ✅ استخدام الترجمة
    const restaurantName = localStorage.getItem('restaurant_name');
    const { data, loading, error } = useDashboardData();

    if (loading) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-xl">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {lang === 'ar' ? 'خطأ: ' : 'Error: '}{error}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout restaurantName={restaurantName}>
            <div className="space-y-6">
                {/* أزرار التنقل السريع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                        onClick={() => navigate(`/dashboard/${slug}/categories`)}
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-orange-500"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">📑</div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">
                                    {lang === 'ar' ? 'إدارة الفئات' : 'Categories'}
                                </h3>
                                <p className="text-gray-600">
                                    {lang === 'ar' 
                                        ? 'إضافة وتعديل وحذف فئات المطعم'
                                        : 'Add, edit, and delete restaurant categories'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => navigate(`/dashboard/${slug}/items`)}
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition border-2 border-transparent hover:border-orange-500"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">🍽️</div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">
                                    {lang === 'ar' ? 'إدارة الأصناف' : 'Menu Items'}
                                </h3>
                                <p className="text-gray-600">
                                    {lang === 'ar'
                                        ? 'إضافة وتعديل وحذف أصناف القائمة'
                                        : 'Add, edit, and delete menu items'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* بطاقات الإحصائيات */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
                        <h3 className="text-gray-500 text-sm font-semibold mb-1">
                            {lang === 'ar' ? 'عدد الأصناف' : 'Items Count'}
                        </h3>
                        <p className="text-3xl font-bold text-gray-800">
                            {data?.stats?.items_count || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-orange-500">
                        <h3 className="text-gray-500 text-sm font-semibold mb-1">
                            {lang === 'ar' ? 'عدد الطلبات' : 'Orders Count'}
                        </h3>
                        <p className="text-3xl font-bold text-gray-800">
                            {data?.stats?.orders_count || 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-500">
                        <h3 className="text-gray-500 text-sm font-semibold mb-1">
                            {lang === 'ar' ? 'حالة المطعم' : 'Restaurant Status'}
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {data?.restaurant?.is_active 
                                ? (lang === 'ar' ? 'نشط' : 'Active')
                                : (lang === 'ar' ? 'غير نشط' : 'Inactive')}
                        </p>
                    </div>
                </div>

                {/* آخر الطلبات */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">
                            {lang === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}
                        </h2>
                    </div>
                    <div className="p-6">
                        {!data?.recent_orders || data.recent_orders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                {lang === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-right">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200 text-gray-600">
                                            <th className="py-3 px-4">
                                                {lang === 'ar' ? 'العميل' : 'Customer'}
                                            </th>
                                            <th className="py-3 px-4">
                                                {lang === 'ar' ? 'المبلغ' : 'Amount'}
                                            </th>
                                            <th className="py-3 px-4">
                                                {lang === 'ar' ? 'الحالة' : 'Status'}
                                            </th>
                                            <th className="py-3 px-4">
                                                {lang === 'ar' ? 'التاريخ' : 'Date'}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recent_orders.map(order => (
                                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium">{order.customer_name}</td>
                                                <td className="py-3 px-4 font-bold text-gray-700">
                                                    {order.total_price} {order.currency || '$'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {order.status === 'completed' 
                                                            ? (lang === 'ar' ? 'مكتمل' : 'Completed')
                                                            : order.status === 'pending' 
                                                                ? (lang === 'ar' ? 'قيد الانتظار' : 'Pending')
                                                                : order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
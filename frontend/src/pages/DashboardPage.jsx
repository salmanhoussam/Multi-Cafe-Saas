// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDashboardData } from '../hooks/useDashboardData';
import { dashboardService } from '../services/dashboardService';
import { useLanguage } from '../contexts/LanguageContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import RecentOrders from '../components/dashboard/RecentOrders';
import Chart, { MultiChart } from '../components/dashboard/Chart';
import StatCard from '../components/dashboard/StatCard'; // المكون الجديد
import CategoryForm from '../components/categories/CategoryForm';
import CategoryList from '../components/categories/CategoryList';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const { lang } = useLanguage();
    const restaurantName = localStorage.getItem('restaurant_name');
    const { data: summaryData, loading: summaryLoading, error: summaryError } = useDashboardData();

    // حالة الفئات
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // جلب الفئات
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const cats = await dashboardService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // تجهيز بيانات الرسوم البيانية
    const popularItemsData = summaryData?.popular_items ? {
        labels: summaryData.popular_items.map(item => item.name),
        values: summaryData.popular_items.map(item => item.percentage)
    } : null;

    // بيانات افتراضية للمبيعات الشهرية (يمكن استبدالها ببيانات حقيقية من API)
    const monthlySalesData = {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
        values: [1200, 1900, 3000, 2500, 2800, 3200]
    };

    // بيانات تدفق الإيرادات (وهمية)
    const revenueFlowData = {
        labels: ['تكلفة البضائع', 'العمولة', 'الإيجار', 'صافي الربح'],
        values: [8000, 2000, 1500, 5000]
    };

    // بيانات مقارنة المبيعات (داخل/خارج) وهمية
    const salesComparisonData = {
        labels: ['يناير', 'فبراير', 'مارس'],
        datasets: [
            { label: lang === 'ar' ? 'داخل' : 'Dine-in', values: [500, 700, 800] },
            { label: lang === 'ar' ? 'خارج' : 'Takeaway', values: [400, 600, 900] }
        ]
    };

    // معالجة حذف فئة
    const handleDeleteCategory = async (id) => {
        if (window.confirm(lang === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
            try {
                await dashboardService.deleteCategory(id);
                fetchCategories(); // إعادة تحميل القائمة
            } catch (error) {
                alert(error.message);
            }
        }
    };

    if (summaryLoading && categoriesLoading) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-xl">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </DashboardLayout>
        );
    }

    if (summaryError) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {lang === 'ar' ? 'خطأ: ' : 'Error: '}{summaryError}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout restaurantName={restaurantName}>
            <div className="space-y-6">
                {/* الشبكة الرئيسية - 8 خلايا */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* الخلية 1: إضافة فئة */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-bold mb-3 border-b pb-2">
                            {lang === 'ar' ? 'إضافة فئة' : 'Add Category'}
                        </h3>
                        <CategoryForm onSuccess={fetchCategories} />
                    </div>

                    {/* الخلية 2: قائمة الفئات */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-3 border-b pb-2">
                            <h3 className="font-bold">{lang === 'ar' ? 'أحدث الفئات' : 'Recent Categories'}</h3>
                            <button
                                onClick={() => navigate(`/dashboard/${slug}/categories`)}
                                className="text-sm text-orange-600 hover:underline"
                            >
                                {lang === 'ar' ? 'عرض الكل' : 'View all'}
                            </button>
                        </div>
                        {categoriesLoading ? (
                            <p className="text-gray-500 text-sm">...</p>
                        ) : (
                            <CategoryList
                                categories={categories}
                                onEdit={(cat) => navigate(`/dashboard/${slug}/categories`)} // نوجه لصفحة التعديل (أو يمكن فتح modal)
                                onDelete={handleDeleteCategory}
                            />
                        )}
                    </div>

                    {/* الخلايا 3-6: البطاقات الإحصائية */}
                    <StatCard
                        title={lang === 'ar' ? 'عدد الأصناف' : 'Items'}
                        value={summaryData?.stats?.items_count || 0}
                        icon="🍽️"
                        colorClass="border-orange-500"
                    />
                    <StatCard
                        title={lang === 'ar' ? 'عدد الطلبات' : 'Orders'}
                        value={summaryData?.stats?.orders_count || 0}
                        icon="📦"
                        colorClass="border-blue-500"
                    />
                    <StatCard
                        title={lang === 'ar' ? 'المبيعات الشهرية' : 'Monthly Sales'}
                        value={summaryData?.stats?.monthly_sales ? `${summaryData.stats.monthly_sales} ${summaryData.stats.currency || '$'}` : '0 $'}
                        icon="💰"
                        colorClass="border-green-500"
                    />
                    <StatCard
                        title={lang === 'ar' ? 'عدد الفئات' : 'Categories'}
                        value={summaryData?.stats?.categories_count || categories.length}
                        icon="📑"
                        colorClass="border-purple-500"
                    />

                    {/* الخلية 7: أفضل العناصر مبيعاً */}
                    <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
                        <h3 className="font-bold mb-3 border-b pb-2">
                            {lang === 'ar' ? 'أفضل العناصر مبيعاً' : 'Top Selling Items'}
                        </h3>
                        <Chart
                            data={popularItemsData || { labels: ['لا توجد بيانات'], values: [100] }}
                            type="bar"
                            height={200}
                        />
                    </div>

                    {/* الخلية 8: اتجاهات المبيعات الشهرية */}
                    <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
                        <h3 className="font-bold mb-3 border-b pb-2">
                            {lang === 'ar' ? 'اتجاهات المبيعات الشهرية' : 'Monthly Sales Trends'}
                        </h3>
                        <Chart
                            data={monthlySalesData}
                            type="line"
                            height={200}
                        />
                    </div>
                </div>

                {/* صف إضافي: تدفق الإيرادات ومقارنة المبيعات (اختياري) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-bold mb-3 border-b pb-2">
                            {lang === 'ar' ? 'تدفق الإيرادات والمصروفات' : 'Revenue & Expenses'}
                        </h3>
                        <Chart data={revenueFlowData} type="bar" height={200} />
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="font-bold mb-3 border-b pb-2">
                            {lang === 'ar' ? 'مقارنة مبيعات الداخل والخارج' : 'Dine-in vs Takeaway'}
                        </h3>
                        <MultiChart
                            datasets={salesComparisonData.datasets}
                            labels={salesComparisonData.labels}
                            type="bar"
                            height={200}
                        />
                    </div>
                </div>

                {/* جدول آخر الطلبات */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b">
                        <h2 className="font-bold text-lg">
                            {lang === 'ar' ? 'آخر الطلبات' : 'Recent Orders'}
                        </h2>
                    </div>
                    <div className="p-4">
                        <RecentOrders orders={summaryData?.recent_orders} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
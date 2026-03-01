// src/hooks/useDashboardData.jsx
import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboardData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('الرجاء تسجيل الدخول أولاً');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                console.log('📡 Fetching dashboard data...');
                const result = await dashboardService.getSummary();
                
                // ✅ تأكد من أن البيانات بالشكل المتوقع
                console.log('✅ Dashboard data received:', result);
                
                // ✅ تأكد من وجود الخصائص الأساسية
                const safeData = {
                    restaurant: result?.restaurant || {},
                    stats: result?.stats || {
                        items_count: 0,
                        orders_count: 0,
                        monthly_sales: 0,
                        currency: '$'
                    },
                    recent_orders: Array.isArray(result?.recent_orders) ? result.recent_orders : [],
                    popular_items: Array.isArray(result?.popular_items) ? result.popular_items : [],
                    period: result?.period || { days: 30, start_date: '', end_date: '' }
                };
                
                setData(safeData);
            } catch (err) {
                console.error('❌ Error fetching dashboard data:', err);
                setError(err.message || 'حدث خطأ في تحميل البيانات');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return { data, loading, error };
};
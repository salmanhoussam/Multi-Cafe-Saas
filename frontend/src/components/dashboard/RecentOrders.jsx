// src/components/dashboard/RecentOrders.jsx
import React from 'react';
import { STATUS_COLORS, STATUS_TRANSLATIONS } from '../../utils/constants';

const RecentOrders = ({ orders }) => {
    if (!orders || orders.length === 0) {
        return <p className="text-gray-500 text-center py-4">لا توجد طلبات بعد</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-right py-3 px-4">العميل</th>
                        <th className="text-right py-3 px-4">المبلغ</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{order.customer_name}</td>
                            <td className="py-3 px-4 font-semibold">
                                {order.total_price} {order.currency || '$'}
                            </td>
                            <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-sm ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                                    {STATUS_TRANSLATIONS[order.status] || order.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('ar-EG')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentOrders;
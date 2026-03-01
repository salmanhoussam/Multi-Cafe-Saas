// src/components/dashboard/StatsCards.jsx
const StatsCards = ({ stats }) => {
    const cards = [
        { 
            title: 'عدد الأصناف', 
            value: stats?.items_count || 0, 
            icon: '🍽️',
            colorClass: 'border-orange-500'
        },
        { 
            title: 'عدد الطلبات', 
            value: stats?.orders_count || 0, 
            icon: '📦',
            colorClass: 'border-blue-500'
        },
        { 
            title: 'المبيعات الشهرية', 
            value: stats?.monthly_sales ? `${stats.monthly_sales} ${stats.currency || '$'}` : '0 $', 
            icon: '💰',
            colorClass: 'border-green-500'
        },
        { 
            title: 'عدد الفئات', 
            value: stats?.categories_count || 0, 
            icon: '📑',
            colorClass: 'border-purple-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div key={index} className={`bg-white rounded-lg shadow p-6 border-r-4 ${card.colorClass}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">{card.title}</p>
                            <p className="text-2xl font-bold mt-1">{card.value}</p>
                        </div>
                        <span className="text-3xl opacity-50">{card.icon}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
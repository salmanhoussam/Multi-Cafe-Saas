// src/components/dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'border-orange-500' }) => {
    return (
        <div className={`bg-white rounded-lg shadow p-4 border-r-4 ${colorClass}`}>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-gray-500 text-xs">{title}</p>
                    <p className="text-xl font-bold mt-1">{value}</p>
                </div>
                <span className="text-2xl opacity-50">{icon}</span>
            </div>
        </div>
    );
};

export default StatCard;
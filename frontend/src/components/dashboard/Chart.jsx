// src/components/dashboard/Chart.jsx (معدل)
import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Chart = ({ 
    data, 
    type = 'line', 
    title, 
    height = 300, 
    currency = '$', 
    showLegend = false,
    customOptions = {} 
}) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        if (data && data.labels && data.values) {
            const colors = {
                primary: 'rgba(249, 115, 22, 1)',
                primaryLight: 'rgba(249, 115, 22, 0.1)',
            };

            setChartData({
                labels: data.labels,
                datasets: [
                    {
                        label: data.label || (type === 'line' ? 'المبيعات' : 'القيمة'),
                        data: data.values,
                        borderColor: colors.primary,
                        backgroundColor: type === 'line' ? colors.primaryLight : colors.primary,
                        borderWidth: 2,
                        tension: 0.3,
                        fill: type === 'line',
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        barPercentage: 0.7,
                        categoryPercentage: 0.8
                    }
                ]
            });
        }
    }, [data, type]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: 'top',
                rtl: true,
                labels: {
                    font: { family: 'Cairo, sans-serif', size: 12 },
                    usePointStyle: true
                }
            },
            title: {
                display: !!title,
                text: title,
                font: { size: 16, family: 'Cairo, sans-serif', weight: 'bold' },
                color: '#374151',
                padding: { bottom: 20 }
            },
            tooltip: {
                rtl: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { family: 'Cairo, sans-serif', size: 13 },
                bodyFont: { family: 'Cairo, sans-serif', size: 12 },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('ar-EG', {
                                style: 'currency',
                                currency: 'USD', // يمكن جعله ديناميكيًا لاحقًا
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                ticks: {
                    font: { family: 'Cairo, sans-serif', size: 11 },
                    callback: (value) => value + ' ' + currency
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    font: { family: 'Cairo, sans-serif', size: 11 },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
        elements: { line: { borderJoinStyle: 'round' } },
        ...customOptions // دمج الخيارات المخصصة
    };

    if (!data || !data.labels || !data.values || data.labels.length === 0) {
        return (
            <div 
                className="flex items-center justify-center bg-gray-50 rounded-lg"
                style={{ height: `${height}px` }}
            >
                <div className="text-center">
                    <p className="text-gray-400 mb-2">📊</p>
                    <p className="text-gray-500">لا توجد بيانات متاحة</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 shadow" style={{ height: `${height + 32}px` }}>
            <div style={{ height: `${height}px` }}>
                {type === 'line' ? (
                    <Line data={chartData} options={options} />
                ) : (
                    <Bar data={chartData} options={options} />
                )}
            </div>
        </div>
    );
};

// نسخة محسنة مع دعم تعدد المجموعات (MultiChart)
export const MultiChart = ({ 
    datasets, 
    labels, 
    title, 
    type = 'line', 
    height = 300,
    currency = '$',
    customOptions = {}
}) => {
    const colors = [
        { primary: 'rgba(249, 115, 22, 1)', light: 'rgba(249, 115, 22, 0.1)' },
        { primary: 'rgba(59, 130, 246, 1)', light: 'rgba(59, 130, 246, 0.1)' },
        { primary: 'rgba(34, 197, 94, 1)', light: 'rgba(34, 197, 94, 0.1)' },
        { primary: 'rgba(168, 85, 247, 1)', light: 'rgba(168, 85, 247, 0.1)' },
    ];

    const chartData = {
        labels: labels || [],
        datasets: datasets?.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.values,
            borderColor: colors[index % colors.length].primary,
            backgroundColor: type === 'line' ? colors[index % colors.length].light : colors[index % colors.length].primary,
            borderWidth: 2,
            tension: 0.3,
            fill: type === 'line',
            pointBackgroundColor: colors[index % colors.length].primary,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        })) || []
    };

    const multiOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                rtl: true,
                labels: {
                    font: { family: 'Cairo, sans-serif', size: 12 },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: !!title,
                text: title,
                font: { size: 16, family: 'Cairo, sans-serif', weight: 'bold' },
                color: '#374151'
            },
            tooltip: {
                rtl: true,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += context.parsed.y + ' ' + currency;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => value + ' ' + currency
                }
            }
        },
        ...customOptions
    };

    if (!datasets || datasets.length === 0) {
        return (
            <div 
                className="flex items-center justify-center bg-gray-50 rounded-lg"
                style={{ height: `${height}px` }}
            >
                <p className="text-gray-500">لا توجد بيانات</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 shadow" style={{ height: `${height + 32}px` }}>
            <div style={{ height: `${height}px` }}>
                {type === 'line' ? (
                    <Line data={chartData} options={multiOptions} />
                ) : (
                    <Bar data={chartData} options={multiOptions} />
                )}
            </div>
        </div>
    );
};

export default Chart;
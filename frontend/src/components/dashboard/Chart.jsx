// src/components/dashboard/Chart.jsx
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

// تسجيل مكونات Chart.js
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

const Chart = ({ data, type = 'line', title, height = 300 }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        if (data && data.labels && data.values) {
            // الألوان الثابتة للرسم البياني
            const colors = {
                primary: 'rgba(249, 115, 22, 1)',    // برتقالي
                primaryLight: 'rgba(249, 115, 22, 0.1)',
                secondary: 'rgba(59, 130, 246, 1)',  // أزرق
                secondaryLight: 'rgba(59, 130, 246, 0.1)'
            };

            // تحضير البيانات للرسم
            setChartData({
                labels: data.labels,
                datasets: [
                    {
                        label: data.label || 'المبيعات',
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

    // خيارات الرسم البياني
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
                position: 'top',
                labels: {
                    font: {
                        family: 'Cairo, sans-serif'
                    }
                }
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    family: 'Cairo, sans-serif',
                    weight: 'bold'
                },
                padding: {
                    bottom: 20
                },
                color: '#374151'
            },
            tooltip: {
                rtl: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    family: 'Cairo, sans-serif',
                    size: 13
                },
                bodyFont: {
                    family: 'Cairo, sans-serif',
                    size: 12
                },
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('ar-EG', {
                                style: 'currency',
                                currency: 'USD',
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
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 11
                    },
                    callback: function(value) {
                        return value + ' $';
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 11
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        },
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            }
        },
        elements: {
            line: {
                borderJoinStyle: 'round'
            }
        }
    };

    // إذا ما في بيانات
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
        <div className="bg-white rounded-lg p-4 shadow">
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

// نسخة محسنة مع دعم تعدد المجموعات
export const MultiChart = ({ datasets, labels, title, type = 'line', height = 300 }) => {
    const colors = [
        { primary: 'rgba(249, 115, 22, 1)', light: 'rgba(249, 115, 22, 0.1)' },  // برتقالي
        { primary: 'rgba(59, 130, 246, 1)', light: 'rgba(59, 130, 246, 0.1)' },  // أزرق
        { primary: 'rgba(34, 197, 94, 1)', light: 'rgba(34, 197, 94, 0.1)' },    // أخضر
        { primary: 'rgba(168, 85, 247, 1)', light: 'rgba(168, 85, 247, 0.1)' },  // بنفسجي
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
                    font: {
                        family: 'Cairo, sans-serif',
                        size: 12
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    family: 'Cairo, sans-serif',
                    weight: 'bold'
                },
                color: '#374151'
            },
            tooltip: {
                rtl: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return value + ' $';
                    }
                }
            }
        }
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
        <div className="bg-white rounded-lg p-4 shadow">
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
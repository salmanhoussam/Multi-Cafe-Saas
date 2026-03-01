// src/utils/constants.js
export const ORDER_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    PREPARING: 'preparing'
};

export const STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-700',
    [ORDER_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
    [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
    [ORDER_STATUS.PREPARING]: 'bg-blue-100 text-blue-700'
};

export const STATUS_TRANSLATIONS = {
    [ORDER_STATUS.PENDING]: 'قيد الانتظار',
    [ORDER_STATUS.COMPLETED]: 'مكتمل',
    [ORDER_STATUS.CANCELLED]: 'ملغي',
    [ORDER_STATUS.PREPARING]: 'قيد التحضير'
};

export const CURRENCY_SYMBOLS = {
    LBP: 'ل.ل',
    USD: '$',
    EUR: '€'
};
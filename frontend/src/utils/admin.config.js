// src/utils/admin.config.js

// 🟢 نطاقات الباك إند للإدارة
const API_DOMAINS = {
    LOCAL: 'http://localhost:8000',
    PRODUCTION: import.meta.env.VITE_API_ADMIN_DOMAIN || 'https://admin.salmansaas.com',  // ✅ استخدام المتغير الجديد
};

// 🟢 تحديد البيئة
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

// 🟢 اختيار الرابط المناسب
const API_BASE_URL = isDevelopment ? API_DOMAINS.LOCAL : API_DOMAINS.PRODUCTION;

console.log('🌍 Admin API Base URL:', API_BASE_URL);
console.log('🔧 Admin Mode:', isDevelopment ? 'development' : 'production');

// ✅ دوال مساعدة للـ endpoints
const createAdminEndpoint = (path) => `${API_BASE_URL}/api/v1/admin${path}`;

// 🟢 روابط API للإدارة
export const ADMIN_API = {
    // 🔐 المصادقة
    LOGIN: () => createAdminEndpoint('/auth/login'),
    LOGOUT: () => createAdminEndpoint('/auth/logout'),
    REFRESH_TOKEN: () => createAdminEndpoint('/auth/refresh'),
    ME: () => createAdminEndpoint('/auth/me'),
    
    // 📊 لوحة التحكم
    DASHBOARD_SUMMARY: () => createAdminEndpoint('/dashboard/summary'),
    DASHBOARD_STATISTICS: () => createAdminEndpoint('/dashboard/statistics'),
    
    // 🗂️ الفئات
    CATEGORIES: () => createAdminEndpoint('/categories'),
    CATEGORY_BY_ID: (id) => createAdminEndpoint(`/categories/${id}`),
    
    // 🍽️ عناصر القائمة
    MENU_ITEMS: () => createAdminEndpoint('/menu-items'),
    MENU_ITEM_BY_ID: (id) => createAdminEndpoint(`/menu-items/${id}`),
    
    // 🖼️ رفع الصور
    UPLOAD_IMAGE: () => createAdminEndpoint('/upload/image'),
    UPLOAD_MULTIPLE: () => createAdminEndpoint('/upload/images'),
    
    // 📦 الطلبات
    ORDERS: () => createAdminEndpoint('/orders'),
    ORDER_BY_ID: (id) => createAdminEndpoint(`/orders/${id}`),
    UPDATE_ORDER_STATUS: (id) => createAdminEndpoint(`/orders/${id}/status`),
    
    // 👥 المستخدمين
    USERS: () => createAdminEndpoint('/users'),
    USER_BY_ID: (id) => createAdminEndpoint(`/users/${id}`),
};

// 🟢 دوال مساعدة للإدارة
export const isAdminPage = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    return path.startsWith('/admin') || path.startsWith('/dashboard') || path === '/login';
};

// ✅ دوال للتعامل مع التوكن
export const adminAuth = {
    setToken: (token) => localStorage.setItem('adminToken', token),
    getToken: () => localStorage.getItem('adminToken'),
    removeToken: () => localStorage.removeItem('adminToken'),
    isAuthenticated: () => !!localStorage.getItem('adminToken'),
};

// ✅ headers مخصصة للأدمن
export const getAdminHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': adminAuth.getToken() ? `Bearer ${adminAuth.getToken()}` : '',
});

export default {
    ADMIN_API,
    isAdminPage,
    adminAuth,
    getAdminHeaders,
};
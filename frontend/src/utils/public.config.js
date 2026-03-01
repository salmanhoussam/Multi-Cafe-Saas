// src/utils/public.config.js

// 🟢 نطاقات الباك إند للعامة
const API_DOMAINS = {
    LOCAL: 'http://localhost:8000',
    PRODUCTION: import.meta.env.VITE_API_PUBLIC_DOMAIN || 'https://menu1.salmansaas.com',  // ✅ استخدام المتغير الجديد
};

// 🟢 تحديد البيئة
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

// 🟢 اختيار الرابط المناسب
const API_BASE_URL = isDevelopment ? API_DOMAINS.LOCAL : API_DOMAINS.PRODUCTION;

console.log('🌍 Public API Base URL:', API_BASE_URL);
console.log('🔧 Public Mode:', isDevelopment ? 'development' : 'production');

// ✅ دوال مساعدة للـ endpoints
const createPublicEndpoint = (path) => `${API_BASE_URL}/api/v1/public${path}`;

// 🟢 روابط API العامة
export const PUBLIC_API = {
    // 🏠 المنيو العام
    FULL_MENU: (slug) => createPublicEndpoint(`/menu/full?slug=${slug}`),
    
    // 🗂️ الفئات العامة
    CATEGORIES: (slug) => createPublicEndpoint(`/categories?slug=${slug}`),
    
    // 🍽️ عناصر القائمة العامة
    ITEMS: (slug, categoryId = '') => {
        const url = createPublicEndpoint(`/items?slug=${slug}`);
        return categoryId ? `${url}&category_id=${categoryId}` : url;
    },
    
    // 🔍 بحث
    SEARCH: (slug, query) => createPublicEndpoint(`/search?slug=${slug}&q=${encodeURIComponent(query)}`),
    
    // ⭐ عناصر مميزة
    FEATURED: (slug) => createPublicEndpoint(`/featured?slug=${slug}`),
    
    // 🏷️ عروض
    OFFERS: (slug) => createPublicEndpoint(`/offers?slug=${slug}`),
    
    // 📞 معلومات المطعم
    RESTAURANT_INFO: (slug) => createPublicEndpoint(`/restaurant/${slug}`),
    
    // 📦 تقديم طلب
    CREATE_ORDER: () => createPublicEndpoint('/orders'),
    TRACK_ORDER: (orderId) => createPublicEndpoint(`/orders/${orderId}/track`),
};

// ✅ استخراج slug المطعم من الرابط
export const getRestaurantSlug = () => {
    if (typeof window === 'undefined') return null;
    
    const pathParts = window.location.pathname.split('/').filter(part => part);
    
    // تجاهل المسارات الخاصة
    const excludedPaths = ['admin', 'dashboard', 'login', 'api', 'assets'];
    
    if (pathParts.length > 0 && !excludedPaths.includes(pathParts[0])) {
        return pathParts[0];
    }
    
    return null;
};

// ✅ التحقق من أن الصفحة هي صفحة منيو عام
export const isPublicMenuPage = () => {
    if (typeof window === 'undefined') return false;
    
    const slug = getRestaurantSlug();
    const path = window.location.pathname;
    
    return slug !== null && 
           !path.startsWith('/admin') && 
           !path.startsWith('/dashboard') && 
           !path.startsWith('/login');
};

// ✅ تخزين مؤقت للـ slug
let cachedSlug = null;

export const getCachedRestaurantSlug = () => {
    if (!cachedSlug) {
        cachedSlug = getRestaurantSlug();
    }
    return cachedSlug;
};

export const clearCachedSlug = () => {
    cachedSlug = null;
};

export default {
    PUBLIC_API,
    getRestaurantSlug,
    isPublicMenuPage,
    getCachedRestaurantSlug,
    clearCachedSlug,
};
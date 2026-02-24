// src/utils/config.js

export const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://menu1.salmansaas.com"; // الباك إند الأساسي

// 1. دالة لمعرفة بيئة العمل الحالية (المنيو أم الداشبورد؟)
export const getAppEnvironment = () => {
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.')) {
        return 'ADMIN'; // نحن الآن في لوحة التحكم
    }
    return 'MENU'; // نحن في منيو المطعم
};

// 2. دالة استخراج Slug المنيو (كما هي)
export const getMenuSlug = () => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'menu' && parts[0] !== 'admin') {
        return parts[0]; 
    }
    
    const params = new URLSearchParams(window.location.search);
    return params.get('slug'); 
};
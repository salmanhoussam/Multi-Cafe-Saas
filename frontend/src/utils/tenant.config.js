// frontend/src/utils/tenant.config.js

class TenantConfig {
    constructor() {
        this.currentSlug = this.detectSlug();
        this.baseDomains = {
            public: import.meta.env.VITE_API_PUBLIC_DOMAIN || 'https://menu1.salmansaas.com',
            admin: import.meta.env.VITE_API_ADMIN_DOMAIN || 'https://admin.salmansaas.com',
            local: 'http://localhost:8000'
        };
    }

    // 🎯 detect slug من الرابط (مطابق لمنطق الباك اند)
    detectSlug() {
        if (typeof window === 'undefined') return null;
        
        // 1️⃣ أولاً: من query parameters (للتطوير)
        const urlParams = new URLSearchParams(window.location.search);
        const slugFromQuery = urlParams.get('slug') || urlParams.get('restaurant');
        if (slugFromQuery) {
            console.log('🏪 Slug from query:', slugFromQuery);
            return slugFromQuery;
        }
        
        // 2️⃣ ثانياً: من subdomain (للإنتاج)
        const host = window.location.hostname;
        const mainDomain = 'salmansaas.com';
        
        if (host.endsWith(mainDomain) && host !== mainDomain && !host.startsWith('www')) {
            const slug = host.replace(`.${mainDomain}`, '');
            // نتأكد أنه مش admin أو menu1
            if (slug !== 'admin' && slug !== 'menu1' && slug !== 'resto') {
                console.log('🏪 Slug from subdomain:', slug);
                return slug;
            }
        }
        
        // 3️⃣ ثالثاً: من path (للمسارات مثل /arizona)
        const path = window.location.pathname;
        const parts = path.split('/').filter(p => p);
        const excluded = ['admin', 'dashboard', 'login', 'api', 'assets'];
        
        for (const part of parts) {
            if (!excluded.includes(part) && !part.startsWith('?')) {
                console.log('🏪 Slug from path:', part);
                return part;
            }
        }
        
        return null;
    }

    // 🏢 هل هي صفحة admin؟
    isAdminPage() {
        const path = window.location.pathname;
        return path.startsWith('/admin') || path.startsWith('/dashboard');
    }

    // 🏢 هل هي صفحة public؟
    isPublicPage() {
        return !this.isAdminPage() && this.currentSlug !== null;
    }

    // 🌍 اختيار الـ base URL المناسب
    getBaseURL() {
        const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';
        
        if (isDev) {
            return this.baseDomains.local;
        }
        
        // في الإنتاج: اختر حسب نوع الصفحة
        return this.isAdminPage() 
            ? this.baseDomains.admin    // admin.salmansaas.com
            : this.baseDomains.public;   // menu1.salmansaas.com
    }

    // 🔗 بناء رابط API كامل (بنفس منطق الباك اند)
    buildURL(endpoint, params = {}) {
        const base = this.getBaseURL();
        let url = `${base}/api/v1${endpoint}`;
        
        // إضافة slug إذا needed (نفس ما الباك اند يتوقع)
        if (this.needsSlug(endpoint) && this.currentSlug) {
            params.slug = this.currentSlug;
        }
        
        // بناء query string
        const query = new URLSearchParams(params).toString();
        return query ? `${url}?${query}` : url;
    }

    // 🎨 هل نحتاج إضافة slug لهذا الـ endpoint؟
    needsSlug(endpoint) {
        // public endpoints تحتاج slug دائماً
        if (endpoint.includes('/public/')) {
            return true;
        }
        
        // admin endpoints لا تحتاج slug (لأنها تعتمد على التوكن)
        if (endpoint.includes('/admin/')) {
            return false;
        }
        
        return false;
    }

    // 📝 endpoints جاهزة (مطابقة للباك اند)
    get endpoints() {
        return {
            // public endpoints - مع slug تلقائي
            public: {
                fullMenu: () => this.buildURL('/public/menu/full'),
                categories: () => this.buildURL('/public/categories'),
                items: (categoryId = '') => this.buildURL('/public/items', {
                    ...(categoryId && { category_id: categoryId })
                }),
                search: (query) => this.buildURL('/public/search', { q: query }),
                restaurantInfo: () => this.buildURL(`/public/restaurant/${this.currentSlug}`),
            },
            
            // admin endpoints - بدون slug (يأخذ من التوكن)
            admin: {
                auth: {
                    login: () => this.buildURL('/admin/auth/login'),
                    logout: () => this.buildURL('/admin/auth/logout'),
                    me: () => this.buildURL('/admin/auth/me'),
                },
                dashboard: {
                    summary: () => this.buildURL('/admin/dashboard/summary'),
                    statistics: () => this.buildURL('/admin/dashboard/statistics'),
                },
                categories: {
                    list: () => this.buildURL('/admin/categories'),
                    detail: (id) => this.buildURL(`/admin/categories/${id}`),
                    create: () => this.buildURL('/admin/categories'),
                    update: (id) => this.buildURL(`/admin/categories/${id}`),
                    delete: (id) => this.buildURL(`/admin/categories/${id}`),
                },
                menuItems: {
                    list: () => this.buildURL('/admin/menu-items'),
                    detail: (id) => this.buildURL(`/admin/menu-items/${id}`),
                    create: () => this.buildURL('/admin/menu-items'),
                    update: (id) => this.buildURL(`/admin/menu-items/${id}`),
                    delete: (id) => this.buildURL(`/admin/menu-items/${id}`),
                },
                upload: {
                    image: () => this.buildURL('/admin/upload/image'),
                    multiple: () => this.buildURL('/admin/upload/images'),
                }
            }
        };
    }

    // 🔧 دوال مساعدة للـ headers
    getHeaders(withAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (withAuth) {
            const token = localStorage.getItem('adminToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    // 📦 دوال مساعدة للـ fetch
    async fetchAPI(endpoint, options = {}) {
        const url = typeof endpoint === 'function' ? endpoint() : endpoint;
        const headers = this.getHeaders(options.withAuth !== false);
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `HTTP error ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            throw error;
        }
    }
}

// نسخة واحدة مشتركة
export const tenant = new TenantConfig();

// دوال مساعدة
export const api = tenant.endpoints;
export const getSlug = () => tenant.currentSlug;
export const isAdmin = () => tenant.isAdminPage();
export const isPublic = () => tenant.isPublicPage();
export const fetchAPI = tenant.fetchAPI.bind(tenant);

export default tenant;
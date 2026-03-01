// src/services/dashboardService.js
import { ADMIN_API } from '../utils/admin.config';

class DashboardService {
    // 🔐 تسجيل الدخول
    async login(slug, password) {
        const url = ADMIN_API.LOGIN();
        console.log('🔐 Logging in to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'فشل تسجيل الدخول');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('restaurant_id', data.restaurant_id);
        localStorage.setItem('restaurant_name', data.restaurant_name || slug);
        localStorage.setItem('restaurant_slug', data.slug);
        localStorage.setItem('manager_id', data.manager_id);
        
        return data;
    }

    // 📊 ملخص الداشبورد
    async getSummary() {
        return this._fetch(ADMIN_API.DASHBOARD_SUMMARY());
    }

    // 🗂️ الفئات
    async getCategories() {
        return this._fetch(ADMIN_API.CATEGORIES());
    }

    async getCategoryById(categoryId) {
        if (!categoryId || categoryId === 'undefined' || categoryId === 'all') {
            return null;
        }
        return this._fetch(ADMIN_API.CATEGORY_BY_ID(categoryId));
    }

    async createCategory(data) {
        return this._fetch(ADMIN_API.CATEGORIES(), {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCategory(categoryId, data) {
        return this._fetch(ADMIN_API.CATEGORY_BY_ID(categoryId), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteCategory(categoryId) {
        return this._fetch(ADMIN_API.CATEGORY_BY_ID(categoryId), {
            method: 'DELETE',
        });
    }

    // 🍔 الأصناف
    async getMenuItems(categoryId = null) {
        const url = ADMIN_API.MENU_ITEMS();
        const finalUrl = (categoryId && categoryId !== 'undefined' && categoryId !== 'all') 
            ? `${url}?category_id=${categoryId}` 
            : url;
        
        return this._fetch(finalUrl);
    }

    async getMenuItemById(itemId) {
        return this._fetch(ADMIN_API.MENU_ITEM_BY_ID(itemId));
    }

    async createMenuItem(data) {
        return this._fetch(ADMIN_API.MENU_ITEMS(), {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateMenuItem(itemId, data) {
        return this._fetch(ADMIN_API.MENU_ITEM_BY_ID(itemId), {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMenuItem(itemId) {
        return this._fetch(ADMIN_API.MENU_ITEM_BY_ID(itemId), {
            method: 'DELETE',
        });
    }

    // 📸 رفع الصور
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch(ADMIN_API.UPLOAD_IMAGE(), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to upload image');
        }

        return response.json();
    }

    // 🛠️ دالة مساعدة للـ fetch مع التوكن
    async _fetch(url, options = {}) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            throw new Error('No authentication token');
        }

        console.log(`📡 Fetching: ${url}`);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            // معالجة الأخطاء
            if (!response.ok) {
                // محاولة قراءة رسالة الخطأ من الباك إند
                let errorDetail = 'Request failed';
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.detail || errorData.message || errorDetail;
                } catch {
                    errorDetail = `HTTP error ${response.status}`;
                }

                // إذا كان الخطأ 401 (غير مصرح)، نوجه لتسجيل الدخول
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('restaurant_id');
                    localStorage.removeItem('restaurant_name');
                    localStorage.removeItem('restaurant_slug');
                    window.location.href = '/login';
                    throw new Error('انتهت الجلسة');
                }

                throw new Error(errorDetail);
            }

            // إذا كانت DELETE، قد لا ترجع محتوى
            if (options.method === 'DELETE') {
                return { success: true };
            }

            // محاولة تحويل الرد إلى JSON
            const data = await response.json();
            return data;

        } catch (error) {
            console.error('❌ Fetch error:', error);
            throw error;
        }
    }
}

// تصدير نسخة واحدة من الخدمة
export const dashboardService = new DashboardService();
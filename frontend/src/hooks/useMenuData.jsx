// src/hooks/useMenuData.jsx
import { useState, useEffect } from 'react';
import { PUBLIC_API, getRestaurantSlug } from '../utils/public.config'; // ✅ استخدام public.config

export const useMenuData = (slug) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            const restaurantSlug = slug || getRestaurantSlug();
            
            if (!restaurantSlug) {
                setError("No restaurant specified");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                console.log(`🍽️ Fetching menu for: ${restaurantSlug}`);
                
                // ✅ استخدام PUBLIC_API من public.config.js
                const url = PUBLIC_API.FULL_MENU(restaurantSlug);
                console.log(`🔗 API URL: ${url}`);
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('المطعم غير موجود');
                    }
                    throw new Error(`خطأ في التحميل (${response.status})`);
                }
                
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error("❌ Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [slug]);

    return { data, loading, error };
};
// src/hooks/useMenuData.jsx
import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/config';

export const useMenuData = (slug) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMenu = async () => {
            if (!slug) {
                setError("No restaurant slug provided");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                
                // سيستخدم الرابط الحقيقي تلقائياً عند الرفع
                const response = await fetch(`${API_BASE}/api/menu/full/${slug}`);
                
                if (!response.ok) {
                    throw new Error('Restaurant not found');
                }
                
                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error("Error fetching menu:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [slug]); 

    return { data, loading, error };
};
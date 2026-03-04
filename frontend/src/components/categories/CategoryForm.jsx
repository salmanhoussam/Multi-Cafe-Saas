// src/components/categories/CategoryForm.jsx
import React, { useState } from 'react';
import { dashboardService } from '../../services/dashboardService';

const CategoryForm = ({ onSuccess }) => {
    const [nameAr, setNameAr] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [sortOrder, setSortOrder] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = '';
            if (imageFile) {
                const uploadRes = await dashboardService.uploadImage(imageFile);
                imageUrl = uploadRes.image_url;
            }
            await dashboardService.createCategory({
                name_ar: nameAr,
                name_en: nameEn,
                sort_order: sortOrder,
                image_url: imageUrl
            });
            // إعادة تعيين النموذج
            setNameAr('');
            setNameEn('');
            setSortOrder(0);
            setImageFile(null);
            // إعلام المكون الأب بالنجاح (لتحديث القائمة)
            if (onSuccess) onSuccess();
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <input
                type="text"
                placeholder="الاسم (عربي)"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                required
            />
            <input
                type="text"
                placeholder="الاسم (إنجليزي)"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                required
            />
            <input
                type="number"
                placeholder="الترتيب"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full p-2 border rounded text-sm"
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full p-1 border rounded text-sm"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition text-sm font-semibold disabled:opacity-50"
            >
                {loading ? 'جاري الحفظ...' : 'إضافة فئة'}
            </button>
        </form>
    );
};

export default CategoryForm;
// src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ADMIN_API } from '../utils/admin.config';
import DashboardLayout from '../components/layout/DashboardLayout'; // ✅ استيراد الـ Layout

const CategoriesPage = () => {
    const { slug } = useParams(); // ✅ جلب slug من الرابط
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        sort_order: 0,
        image_url: ''
    });
    
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const restaurantName = localStorage.getItem('restaurant_name');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const url = ADMIN_API.CATEGORIES();
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 403 || response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setCategories(data);
            } else if (data && Array.isArray(data.categories)) {
                setCategories(data.categories);
            } else if (data && Array.isArray(data.data)) {
                setCategories(data.data);
            } else {
                setCategories([]);
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
            setError('فشل في تحميل الفئات: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalImageUrl = formData.image_url;

            if (imageFile) {
                const fileData = new FormData();
                fileData.append('file', imageFile);
                
                const uploadRes = await fetch(ADMIN_API.UPLOAD_IMAGE(), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: fileData
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    finalImageUrl = uploadData.image_url;
                } else {
                    const errData = await uploadRes.json();
                    alert(`فشل رفع الصورة: ${errData.detail || 'خطأ غير معروف'}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const url = editingCategory 
                ? ADMIN_API.CATEGORY_BY_ID(editingCategory.id)
                : ADMIN_API.CATEGORIES();
            
            const method = editingCategory ? 'PUT' : 'POST';
            
            const bodyData = {
                name_ar: formData.name_ar,
                name_en: formData.name_en,
                sort_order: formData.sort_order,
                image_url: finalImageUrl
            };
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            if (response.ok) {
                setShowModal(false);
                setEditingCategory(null);
                setFormData({ name_ar: '', name_en: '', sort_order: 0, image_url: '' });
                setImageFile(null);
                fetchCategories();
            } else {
                const errorData = await response.json();
                alert(`خطأ: ${errorData.detail || 'فشل في الحفظ'}`);
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('حدث خطأ في الاتصال');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
        
        try {
            const response = await fetch(ADMIN_API.CATEGORY_BY_ID(id), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                fetchCategories();
            } else {
                alert('فشل الحذف');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('حدث خطأ في الاتصال');
        }
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name_ar: category.name_ar,
            name_en: category.name_en,
            sort_order: category.sort_order || 0,
            image_url: category.image_url || ''
        });
        setImageFile(null);
        setShowModal(true);
    };

    if (loading) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="flex items-center justify-center h-64">
                    <p className="text-xl">جاري التحميل...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout restaurantName={restaurantName}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">إدارة الفئات</h2>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(`/dashboard/${slug}`)} // ✅ استخدام slug
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                        >
                            العودة للرئيسية
                        </button>
                        <button
                            onClick={() => {
                                setEditingCategory(null);
                                setFormData({ name_ar: '', name_en: '', sort_order: 0, image_url: '' });
                                setImageFile(null);
                                setShowModal(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            + إضافة فئة جديدة
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                            <button 
                                onClick={fetchCategories}
                                className="mr-4 bg-red-200 px-3 py-1 rounded hover:bg-red-300"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    </div>
                )}

                {/* Categories Grid */}
                <div className="p-6">
                    {categories.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">لا توجد فئات بعد</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categories.map(cat => (
                                <div key={cat.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                                    {cat.image_url && (
                                        <img 
                                            src={cat.image_url} 
                                            alt={cat.name_ar}
                                            className="w-full h-40 object-cover rounded-lg mb-3"
                                        />
                                    )}
                                    <h3 className="text-xl font-bold mb-2">{cat.name_ar}</h3>
                                    <p className="text-gray-600 mb-2">{cat.name_en}</p>
                                    <p className="text-sm text-gray-500 mb-4">ترتيب: {cat.sort_order || 0}</p>
                                    
                                    <div className="flex justify-between gap-2">
                                        <button
                                            onClick={() => navigate(`/dashboard/${slug}/items/${cat.id}`)} // ✅ استخدام slug
                                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
                                        >
                                            عرض الأصناف
                                        </button>
                                        <button
                                            onClick={() => openEditModal(cat)}
                                            className="flex-1 bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 text-sm"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">الاسم (عربي)</label>
                                <input
                                    type="text"
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">الاسم (إنجليزي)</label>
                                <input
                                    type="text"
                                    value={formData.name_en}
                                    onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">الترتيب</label>
                                <input
                                    type="number"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">صورة الفئة</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                />
                                {formData.image_url && !imageFile && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-1">الصورة الحالية:</p>
                                        <img src={formData.image_url} alt="Current" className="h-20 rounded object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 text-white py-2 rounded-lg transition duration-200 ${
                                        isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                >
                                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CategoriesPage;
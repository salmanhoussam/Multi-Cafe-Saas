// src/pages/MenuItemsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import DashboardLayout from '../components/layout/DashboardLayout';

const MenuItemsPage = () => {
    const { slug, categoryId } = useParams();
    const navigate = useNavigate();
    
    const [items, setItems] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const restaurantName = localStorage.getItem('restaurant_name');

    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        price: '',
        currency: '$',
        image_url: '',
        is_available: true
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [categoryId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // جلب معلومات الفئة إذا كان لدينا categoryId
            if (categoryId && categoryId !== 'undefined' && categoryId !== 'all') {
                try {
                    const catData = await dashboardService.getCategoryById(categoryId);
                    setCategory(catData);
                } catch (err) {
                    console.error('Error fetching category:', err);
                }
            }

            // جلب الأصناف
            const itemsData = await dashboardService.getMenuItems(categoryId);
            setItems(itemsData);
            
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'فشل في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalImageUrl = formData.image_url;

            // رفع الصورة إذا تم اختيار صورة جديدة
            if (imageFile) {
                const uploadResult = await dashboardService.uploadImage(imageFile);
                finalImageUrl = uploadResult.image_url;
            }

            // تجهيز بيانات الصنف
            const itemData = {
                name_ar: formData.name_ar,
                name_en: formData.name_en,
                description_ar: formData.description_ar,
                description_en: formData.description_en,
                price: parseFloat(formData.price),
                currency: formData.currency,
                image_url: finalImageUrl,
                is_available: formData.is_available,
                category_id: categoryId
            };

            if (editingItem) {
                // تحديث صنف موجود
                await dashboardService.updateMenuItem(editingItem.id, itemData);
            } else {
                // إنشاء صنف جديد
                await dashboardService.createMenuItem(itemData);
            }

            // إعادة تحميل البيانات
            await fetchData();
            
            // إغلاق النافذة
            setShowModal(false);
            resetForm();
            
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.message || 'حدث خطأ أثناء الحفظ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name_ar: '', name_en: '', description_ar: '', description_en: '',
            price: '', currency: '$', image_url: '', is_available: true
        });
        setImageFile(null);
        setEditingItem(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الصنف؟')) return;
        
        try {
            await dashboardService.deleteMenuItem(id);
            await fetchData();
        } catch (err) {
            alert(err.message || 'فشل الحذف');
        }
    };

    const toggleAvailability = async (item) => {
        try {
            await dashboardService.updateMenuItem(item.id, {
                is_available: !item.is_available
            });
            await fetchData();
        } catch (err) {
            alert(err.message || 'فشل في تغيير الحالة');
        }
    };

    if (loading) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                        <p className="text-xl">جاري التحميل...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout restaurantName={restaurantName}>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    خطأ: {error}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout restaurantName={restaurantName}>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">إدارة الأصناف</h1>
                        {category && (
                            <p className="text-gray-600 mt-1 font-medium">الفئة: {category.name_ar}</p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate(`/dashboard/${slug}/categories`)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                        >
                            العودة للفئات
                        </button>
                        <button
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            + إضافة صنف جديد
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    {items.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-12 text-center">
                            <p className="text-gray-500 mb-4 text-lg">لا توجد أصناف في هذه الفئة</p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition"
                            >
                                أضف أول صنف
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(item => (
                                <div key={item.id} className="bg-gray-50 rounded-lg shadow overflow-hidden hover:shadow-md transition">
                                    {item.image_url ? (
                                        <img 
                                            src={item.image_url} 
                                            alt={item.name_ar}
                                            className="w-full h-48 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                                            بدون صورة
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold">{item.name_ar}</h3>
                                            <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                                item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.is_available ? 'متوفر' : 'غير متوفر'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2">{item.name_en}</p>
                                        {item.description_ar && (
                                            <p className="text-gray-500 text-sm mb-2">{item.description_ar}</p>
                                        )}
                                        <p className="text-2xl font-bold text-orange-600 mb-4">
                                            {item.price} {item.currency}
                                        </p>
                                        <div className="flex justify-between items-center border-t pt-4 mt-2">
                                            <button
                                                onClick={() => toggleAvailability(item)}
                                                className={`px-3 py-1 rounded text-sm font-medium transition ${
                                                    item.is_available 
                                                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                }`}
                                            >
                                                {item.is_available ? 'تعطيل' : 'تفعيل'}
                                            </button>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingItem(item);
                                                        setFormData({
                                                            name_ar: item.name_ar,
                                                            name_en: item.name_en,
                                                            description_ar: item.description_ar || '',
                                                            description_en: item.description_en || '',
                                                            price: item.price,
                                                            currency: item.currency || '$',
                                                            image_url: item.image_url || '',
                                                            is_available: item.is_available
                                                        });
                                                        setImageFile(null);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-orange-600 hover:text-orange-800 font-semibold"
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-red-600 hover:text-red-800 font-semibold"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
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
                    <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                            {editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 font-medium">الاسم (عربي) *</label>
                                    <input
                                        type="text"
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 font-medium">الاسم (إنجليزي) *</label>
                                    <input
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">الوصف (عربي)</label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                    rows="2"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">الوصف (إنجليزي)</label>
                                <textarea
                                    value={formData.description_en}
                                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                    rows="2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 font-medium">السعر *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 mb-2 font-medium">العملة</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                    >
                                        <option value="$">دولار ($)</option>
                                        <option value="ل.ل">ليرة لبنانية (ل.ل)</option>
                                        <option value="€">يورو (€)</option>
                                    </select>
                                </div>
                            </div>

                            {/* رفع الصورة */}
                            <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-gray-700 mb-2 font-medium">صورة الصنف</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    className="w-full p-2 border bg-white border-gray-300 rounded focus:outline-none focus:border-orange-500"
                                />
                                {formData.image_url && !imageFile && (
                                    <div className="mt-3">
                                        <p className="text-sm text-gray-500 mb-1">الصورة الحالية:</p>
                                        <img src={formData.image_url} alt="Current item" className="h-24 rounded object-cover border" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                                        className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                                    />
                                    <span className="mr-2 text-gray-700 font-medium">متوفر للطلب</span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex-1 text-white py-3 rounded-lg font-bold transition duration-200 ${
                                        isSubmitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                >
                                    {isSubmitting ? 'جاري الحفظ...' : (editingItem ? 'تحديث الصنف' : 'حفظ الصنف')}
                                </button>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition duration-200"
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

export default MenuItemsPage;
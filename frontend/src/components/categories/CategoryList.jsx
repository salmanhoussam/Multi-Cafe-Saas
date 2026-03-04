// src/components/categories/CategoryList.jsx
import React from 'react';

const CategoryList = ({ categories, onEdit, onDelete }) => {
    if (!categories || categories.length === 0) {
        return <p className="text-gray-500 text-sm">لا توجد فئات</p>;
    }

    // عرض آخر 5 فئات فقط (للمساحة المحدودة)
    const displayCategories = categories.slice(0, 5);

    return (
        <ul className="divide-y">
            {displayCategories.map((cat) => (
                <li key={cat.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                        {cat.image_url && (
                            <img src={cat.image_url} alt={cat.name_ar} className="w-6 h-6 rounded-full object-cover" />
                        )}
                        <span className="text-sm font-medium truncate max-w-[100px]">{cat.name_ar}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                        <button
                            onClick={() => onEdit(cat)}
                            className="text-orange-600 hover:text-orange-800"
                        >
                            تعديل
                        </button>
                        <button
                            onClick={() => onDelete(cat.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            حذف
                        </button>
                    </div>
                </li>
            ))}
            {categories.length > 5 && (
                <li className="py-2 text-center text-xs text-gray-500">
                    + {categories.length - 5} فئات أخرى
                </li>
            )}
        </ul>
    );
};

export default CategoryList;
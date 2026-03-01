// src/components/common/CartModal.jsx
import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';

const CartModal = ({ isOpen, onClose, restaurantPhone }) => {
    const { cart, removeFromCart, updateQuantity, updateNotes, cartTotal, currency } = useCart();
    const { t, lang } = useLanguage();
    const [localNotes, setLocalNotes] = useState({}); // لتخزين الملاحظات المؤقتة

    if (!isOpen) return null;

    const handleNotesChange = (itemId, value) => {
        setLocalNotes(prev => ({ ...prev, [itemId]: value }));
    };

    const handleNotesBlur = (itemId) => {
        if (localNotes[itemId] !== undefined) {
            updateNotes(itemId, localNotes[itemId]);
        }
    };

    const generateWhatsAppMessage = () => {
        if (!cart.length) return '';
        
        let message = `*طلب جديد*\n\n`;
        cart.forEach(item => {
            message += `• ${item.name} (x${item.quantity}) - ${item.price} ${currency}\n`;
            if (item.notes) {
                message += `  _ملاحظات: ${item.notes}_\n`;
            }
        });
        message += `\n*الإجمالي: ${cartTotal.toFixed(2)} ${currency}*`;
        return encodeURIComponent(message);
    };

    const handleWhatsAppCheckout = () => {
        if (!restaurantPhone) {
            alert(t('noPhoneNumber'));
            return;
        }
        const message = generateWhatsAppMessage();
        const phone = restaurantPhone.startsWith('+') ? restaurantPhone.substring(1) : restaurantPhone;
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}>
            <div 
                className="bg-white w-full max-w-md h-full overflow-y-auto p-4 shadow-xl"
                onClick={e => e.stopPropagation()}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('yourCart')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>

                {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{t('emptyCart')}</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="border-b pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {item.price} {item.currency}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <textarea
                                            placeholder={t('notePlaceholder')}
                                            value={localNotes[item.id] !== undefined ? localNotes[item.id] : item.notes || ''}
                                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                            onBlur={() => handleNotesBlur(item.id)}
                                            className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            rows="1"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between font-bold text-lg mb-4">
                                <span>{t('total')}:</span>
                                <span>{cartTotal.toFixed(2)} {currency}</span>
                            </div>
                            <button
                                onClick={handleWhatsAppCheckout}
                                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fab fa-whatsapp"></i>
                                {t('checkoutWhatsApp')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartModal;
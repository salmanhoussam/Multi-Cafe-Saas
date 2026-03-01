// src/components/layout/FloatingCart.jsx
import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useLanguage } from '../../contexts/LanguageContext';
import CartModal from '../common/CartModal';

const FloatingCart = ({ restaurantPhone }) => {
    const { cartCount, cartTotal, currency } = useCart();
    const { t, lang } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (cartCount === 0) return null;

    return (
        <>
            <div className="fixed bottom-6 left-0 right-0 px-4 z-50 animate-bounce-in">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full max-w-md mx-auto bg-orange-600 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center font-bold">
                            {cartCount}
                        </div>
                        <span className="font-bold">{t('viewCart')}</span>
                    </div>
                    <span className="font-black text-lg">
                        {cartTotal.toFixed(2)} <small className="text-xs font-normal opacity-80">{currency}</small>
                    </span>
                </button>
            </div>
            <CartModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                restaurantPhone={restaurantPhone}
            />
        </>
    );
};

export default FloatingCart;
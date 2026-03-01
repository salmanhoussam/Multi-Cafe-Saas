// src/contexts/CartContext.jsx
import { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    const addToCart = (item, notes = '') => {
        setCart((prev) => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id 
                    ? { ...i, quantity: i.quantity + 1, notes: notes || i.notes } 
                    : i
                );
            }
            return [...prev, { ...item, quantity: 1, notes }];
        });
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(id);
            return;
        }
        setCart((prev) =>
            prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
        );
    };

    const updateNotes = (id, newNotes) => {
        setCart((prev) =>
            prev.map(item => item.id === id ? { ...item, notes: newNotes } : item)
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
    const currency = cart.length > 0 ? cart[0].currency : '$';

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            updateNotes,
            clearCart,
            cartTotal,
            cartCount,
            currency
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
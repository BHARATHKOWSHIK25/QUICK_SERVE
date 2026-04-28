import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [orderType, setOrderType] = useState('dine-in');

  const addItem = useCallback((item, restId, restName) => {
    // If cart belongs to different restaurant, clear first
    if (restaurantId && restaurantId !== restId) {
      if (!window.confirm(`Your cart has items from "${restaurantName}". Starting a new order will clear your current cart. Continue?`)) {
        return false;
      }
      setCartItems([]);
      setRestaurantId(restId);
      setRestaurantName(restName);
    } else if (!restaurantId) {
      setRestaurantId(restId);
      setRestaurantName(restName);
    }

    setCartItems(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) {
        return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  }, [restaurantId, restaurantName]);

  const removeItem = useCallback((itemId) => {
    setCartItems(prev => {
      const existing = prev.find(ci => ci.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(ci => ci.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci);
      }
      const updated = prev.filter(ci => ci.id !== itemId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName('');
      }
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  }, []);

  const getQuantity = useCallback((itemId) => {
    const item = cartItems.find(ci => ci.id === itemId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  const totalItems = cartItems.reduce((s, ci) => s + ci.quantity, 0);
  const totalPrice = cartItems.reduce((s, ci) => s + ci.price * ci.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, restaurantId, restaurantName, orderType, setOrderType,
      addItem, removeItem, clearCart, getQuantity,
      totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

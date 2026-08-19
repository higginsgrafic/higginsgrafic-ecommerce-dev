import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch { /* ignore */ }
  }, [cartItems]);

  const addToCart = useCallback((product, size, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && item.size === size
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, size, quantity }];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId, size, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems(prev => prev.filter(item => !(item.id === itemId && item.size === size)));
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === itemId && item.size === size)));
  }, []);

  const updateSize = useCallback((itemId, oldSize, newSize, quantity) => {
    setCartItems(prev => {
      const item = prev.find(i => i.id === itemId && i.size === oldSize);
      if (!item) return prev;

      const newCartItems = prev.filter(i => !(i.id === itemId && i.size === oldSize));
      const existingNewSizeItem = newCartItems.find(i => i.id === itemId && i.size === newSize);

      if (existingNewSizeItem) {
        return newCartItems.map(i =>
          i.id === itemId && i.size === newSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        return [...newCartItems, { ...item, size: newSize, quantity }];
      }
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  }, [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + ((Number(item.price) || 0) * (item.quantity || 1)), 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateSize,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }), [cartItems, addToCart, updateQuantity, removeFromCart, updateSize, clearCart, getTotalItems, getTotalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart ha de ser utilitzat dins de CartProvider');
  }
  return context;
};

export default CartContext;

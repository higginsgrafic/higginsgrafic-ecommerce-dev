import React, { createContext, useContext, useState, useEffect } from 'react';

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
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, quantity = 1) => {
    const existingItem = cartItems.find(
      item => item.id === product.id && item.size === size
    );

    if (existingItem) {
      setCartItems(
        cartItems.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, size, quantity }]);
    }
  };

  const updateQuantity = (itemId, size, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId, size);
      return;
    }

    setCartItems(
      cartItems.map(item =>
        item.id === itemId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId, size) => {
    setCartItems(cartItems.filter(item => !(item.id === itemId && item.size === size)));
  };

  const updateSize = (itemId, oldSize, newSize, quantity) => {
    const item = cartItems.find(i => i.id === itemId && i.size === oldSize);
    if (!item) return;

    const newCartItems = cartItems.filter(i => !(i.id === itemId && i.size === oldSize));
    const existingNewSizeItem = newCartItems.find(i => i.id === itemId && i.size === newSize);

    if (existingNewSizeItem) {
      setCartItems(
        newCartItems.map(i =>
          i.id === itemId && i.size === newSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      setCartItems([...newCartItems, { ...item, size: newSize, quantity }]);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateSize,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

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

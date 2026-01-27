import { useCallback } from 'react';
import { useProductContext } from '@/contexts/ProductContext';

/**
 * Hook personalitzat per gestionar el cistell
 * Proporciona funcions per afegir, actualitzar i eliminar productes
 */
export const useCart = () => {
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateSize,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useProductContext();

  // Obtenir quantitat d'un producte específic amb talla
  const getItemQuantity = useCallback((productId, size) => {
    const item = cartItems.find(
      item => item.id === productId && item.size === size
    );
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Comprovar si un producte està al cistell
  const isInCart = useCallback((productId, size) => {
    return cartItems.some(item => item.id === productId && item.size === size);
  }, [cartItems]);

  // Obtenir subtotal (sense enviament)
  const getSubtotal = useCallback(() => {
    return getTotalPrice();
  }, [getTotalPrice]);

  // Calcular cost d'enviament (gratuït > 50€)
  const getShippingCost = useCallback(() => {
    const subtotal = getSubtotal();
    return subtotal >= 50 ? 0 : 5.95;
  }, [getSubtotal]);

  // Obtenir total (subtotal + enviament)
  const getTotal = useCallback(() => {
    return getSubtotal() + getShippingCost();
  }, [getSubtotal, getShippingCost]);

  // Comprovar si hi ha enviament gratuït
  const hasFreeShipping = useCallback(() => {
    return getSubtotal() >= 50;
  }, [getSubtotal]);

  // Calcular quant falta per enviament gratuït
  const getAmountForFreeShipping = useCallback(() => {
    const subtotal = getSubtotal();
    return subtotal < 50 ? 50 - subtotal : 0;
  }, [getSubtotal]);

  // Obtenir resum del cistell
  const getCartSummary = useCallback(() => {
    return {
      itemCount: getTotalItems(),
      subtotal: getSubtotal(),
      shipping: getShippingCost(),
      total: getTotal(),
      hasFreeShipping: hasFreeShipping(),
      amountForFreeShipping: getAmountForFreeShipping()
    };
  }, [getTotalItems, getSubtotal, getShippingCost, getTotal, hasFreeShipping, getAmountForFreeShipping]);

  // Incrementar quantitat
  const incrementQuantity = useCallback((productId, size) => {
    const item = cartItems.find(i => i.id === productId && i.size === size);
    if (item) {
      updateQuantity(productId, size, item.quantity + 1);
    }
  }, [cartItems, updateQuantity]);

  // Decrementar quantitat
  const decrementQuantity = useCallback((productId, size) => {
    const item = cartItems.find(i => i.id === productId && i.size === size);
    if (item && item.quantity > 1) {
      updateQuantity(productId, size, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeFromCart(productId, size);
    }
  }, [cartItems, updateQuantity, removeFromCart]);

  // Obtenir productes únics (sense repetir per talla)
  const getUniqueProducts = useCallback(() => {
    const uniqueMap = new Map();
    cartItems.forEach(item => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });
    return Array.from(uniqueMap.values());
  }, [cartItems]);

  return {
    // Estat
    cartItems,
    isEmpty: cartItems.length === 0,

    // Funcions bàsiques
    addToCart,
    updateQuantity,
    removeFromCart,
    updateSize,
    clearCart,

    // Funcions d'utilitat
    getItemQuantity,
    isInCart,
    incrementQuantity,
    decrementQuantity,
    getUniqueProducts,

    // Càlculs
    getTotalItems,
    getSubtotal,
    getShippingCost,
    getTotal,
    hasFreeShipping,
    getAmountForFreeShipping,
    getCartSummary
  };
};

export default useCart;

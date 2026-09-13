import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { normalitzaArticle, comptaArticles } from '@/lib/cartItems';

/**
 * El cistell de la botiga. N'hi ha UN de sol.
 *
 * Abans hi havia aquest cistell i, a més, un de propi del mega-slide que no es
 * comunicaven: el botó "afegir al cistell" de les fitxes de producte omplia
 * aquest, però el carretó que es veu a la pantalla llegia l'altre, i per tant
 * sortia buit i no es podia comprar. Vegeu src/lib/cartItems.js.
 */

const CartContext = createContext();

// Els articles desats poden ser d'una versió anterior (formes antigues): els
// fem passar tots pel mateix sedàs en carregar-los, perquè cap pantalla es
// trobi camps que no existeixen.
function llegirCistellDesat() {
  try {
    const desat = localStorage.getItem('cart');
    const parsed = desat ? JSON.parse(desat) : [];
    return Array.isArray(parsed) ? parsed.map((it) => normalitzaArticle(it)) : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(llegirCistellDesat);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch { /* ignore */ }
  }, [cartItems]);

  /**
   * Escritura directa de la llista, amb la mateixa forma que un setState de
   * React (accepta una funció o una llista nova). La fa servir el mega-slide,
   * que actualitza el cistell des de dins del seu propi dibuix.
   */
  const setCartItemsSegur = useCallback((actualitzador) => {
    setCartItems((previs) => {
      const seguent = typeof actualitzador === 'function' ? actualitzador(previs) : actualitzador;
      return Array.isArray(seguent) ? seguent.map((it) => normalitzaArticle(it)) : previs;
    });
  }, []);

  const addToCart = useCallback((product, size, quantity = 1) => {
    const article = normalitzaArticle(product, { size, quantity });

    setCartItems((previs) => {
      const existent = previs.find((it) => it.id === article.id);
      if (existent) {
        return previs.map((it) =>
          it.id === article.id
            ? normalitzaArticle({ ...it, qty: (it.qty || 1) + article.qty })
            : it
        );
      }
      return [...previs, article];
    });
  }, []);

  const updateQuantity = useCallback((itemId, size, newQuantity) => {
    if (newQuantity === 0) {
      setCartItems((prev) => prev.filter((it) => !(it.id === itemId && it.size === size)));
      return;
    }

    setCartItems((prev) =>
      prev.map((it) =>
        it.id === itemId && it.size === size
          ? normalitzaArticle({ ...it, qty: newQuantity })
          : it
      )
    );
  }, []);

  const removeFromCart = useCallback((itemId, size) => {
    setCartItems((prev) => prev.filter((it) => !(it.id === itemId && it.size === size)));
  }, []);

  const updateSize = useCallback((itemId, oldSize, newSize, quantity) => {
    setCartItems((prev) => {
      const article = prev.find((it) => it.id === itemId && it.size === oldSize);
      if (!article) return prev;

      const resta = prev.filter((it) => !(it.id === itemId && it.size === oldSize));
      const mateixNou = resta.find((it) => it.id === itemId && it.size === newSize);

      if (mateixNou) {
        return resta.map((it) =>
          it.id === itemId && it.size === newSize
            ? normalitzaArticle({ ...it, qty: (it.qty || 1) + quantity })
            : it
        );
      }
      return [...resta, normalitzaArticle({ ...article, size: newSize, qty: quantity })];
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => comptaArticles(cartItems), [cartItems]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, it) => {
      const unit = Number(it.unitPrice ?? it.price) || 0;
      return total + unit * (Number(it.qty ?? it.quantity ?? 1) || 1);
    }, 0);
  }, [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    setCartItems: setCartItemsSegur,
    addToCart,
    updateQuantity,
    removeFromCart,
    updateSize,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }), [cartItems, setCartItemsSegur, addToCart, updateQuantity, removeFromCart, updateSize, clearCart, getTotalItems, getTotalPrice]);

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

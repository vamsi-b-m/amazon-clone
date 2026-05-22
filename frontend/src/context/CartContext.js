import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], total: 0 }); return; }
    try {
      const { data } = await cartAPI.getCart();
      setCart(data);
    } catch {}
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) return false;
    setLoading(true);
    try {
      const { data } = await cartAPI.addItem({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || '',
        quantity,
      });
      setCart(data);
      return true;
    } catch { return false; }
    finally { setLoading(false); }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const { data } = await cartAPI.updateItem(productId, quantity);
      setCart(data);
    } catch {}
    finally { setLoading(false); }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const { data } = await cartAPI.removeItem(productId);
      setCart(data);
    } catch {}
    finally { setLoading(false); }
  };

  const clearCart = async () => {
    try { await cartAPI.clearCart(); setCart({ items: [], total: 0 }); } catch {}
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

"use client";

import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);

  const addItem = (item, shopId) => {
    // Prevent adding item from different shop
    if (cart && cart.shopId && cart.shopId !== shopId) {
      if (confirm('Your cart contains items from a different shop. Clear the cart and add this item?')) {
        setCart({ shopId, items: [{ ...item, quantity: 1 }] });
      }
      return;
    }

    if (!cart) {
      setCart({ shopId, items: [{ ...item, quantity: 1 }] });
      return;
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(i => i._id === item._id);
    let updatedItems = [...cart.items];

    if (existingItemIndex > -1) {
      updatedItems[existingItemIndex].quantity += 1;
    } else {
      updatedItems.push({ ...item, quantity: 1 });
    }

    setCart({ shopId, items: updatedItems });
  };

  const removeItem = (itemId) => {
    if (!cart) return;
    const updatedItems = cart.items.filter(i => i._id !== itemId);
    
    if (updatedItems.length === 0) {
      setCart(null);
    } else {
      setCart({ ...cart, items: updatedItems });
    }
  };

  const updateQuantity = (itemId, count) => {
     if (!cart) return;
     const updatedItems = cart.items.map(item => 
        item._id === itemId ? { ...item, quantity: count } : item
     ).filter(item => item.quantity > 0);

     if (updatedItems.length === 0) {
        setCart(null);
     } else {
        setCart({ ...cart, items: updatedItems });
     }
  };

  const clearCart = () => setCart(null);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

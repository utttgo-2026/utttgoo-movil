import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { FoodItem } from '@/types/models';

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (food: FoodItem, quantity?: number) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((food: FoodItem, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.food.id === food.id);
      if (existing) {
        return current.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { food, quantity }];
    });
  }, []);

  const removeItem = useCallback((foodId: string) => {
    setItems((current) => current.filter((item) => item.food.id !== foodId));
  }, []);

  const updateQuantity = useCallback((foodId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.food.id === foodId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.food.price * item.quantity, 0);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}

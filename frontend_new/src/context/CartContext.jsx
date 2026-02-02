import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity, cutType) => {
    const itemIdentifier = `${product.id}-${cutType}`;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemIdentifier);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === itemIdentifier ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, id: itemIdentifier, quantity, cutType }];
    });
  };

  const cartCount = cart.reduce((total, item) => total + 1, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
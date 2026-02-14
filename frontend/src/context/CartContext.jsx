import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product, quantity, cutType) => {
    // Ensure numeric values to prevent $NaN
    const price = Number(product.price) || 0;
    const qty = Number(quantity) || 0;

    /**
     * LOGIC FIX: Prevent duplicate rows when clicking '+' in the drawer.
     * We check if the product.id already includes the cutType.
     * If it does, we use the ID as-is. If not (from Products page), we create the identifier.
     */
    const itemIdentifier = product.id.includes(cutType) 
      ? product.id 
      : `${product.id}-${cutType}`;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemIdentifier);
      
      if (existingItem) {
        // If item exists, update the quantity (ensuring a 0.5kg minimum)
        return prevCart.map(item =>
          item.id === itemIdentifier 
            ? { ...item, quantity: Math.max(0.5, item.quantity + qty) } 
            : item
        );
      }
      
      // If it's a brand new item being added from the catalog
      return [...prevCart, { 
        ...product, 
        id: itemIdentifier, 
        price, 
        quantity: qty, 
        cutType 
      }];
    });
  };

  /**
   * NEW: Remove a specific item row entirely from the cart
   */
  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  // Sum of all weights/quantities for the cart bubble
  const cartCount = cart.length;

  // Safe subtotal calculation to prevent $NaN
  const subtotal = cart.reduce((total, item) => {
    const itemPrice = Number(item.price) || 0;
    const itemQty = Number(item.quantity) || 0;
    return total + (itemPrice * itemQty);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      cartCount, 
      subtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
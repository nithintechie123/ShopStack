import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stockQuantity, item.quantity + quantity) }
            : item
        );
      }
      return [...prevItems, { product, quantity: Math.min(product.stockQuantity, quantity) }];
    });
  };

  const updateQuantity = (product, newQuantity) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.product.id !== product.id);
      }
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stockQuantity, newQuantity) }
            : item
        );
      }
      return [...prevItems, { product, quantity: Math.min(product.stockQuantity, newQuantity) }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };


  const removePurchasedItems = (productIds) => {
  setCartItems((prevItems) =>
    prevItems.filter((item) => !productIds.includes(item.product.id))
  );
};


  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider
  value={{
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    removePurchasedItems,
    clearCart,
    cartCount,
    cartSubtotal
  }}
>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

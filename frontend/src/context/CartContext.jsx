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
    const existing = cartItems.find((item) => item.product.id === product.id);
    const existingQty = existing ? existing.quantity : 0;
    
    if (existingQty + quantity > product.stockQuantity) {
      alert(`Cannot add more items. Only ${product.stockQuantity} items are available in stock, and you already have ${existingQty} in your cart.`);
      return false;
    }

    setCartItems((prevItems) => {
      const existingInState = prevItems.find((item) => item.product.id === product.id);
      if (existingInState) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
    return true;
  };

  const updateQuantity = (product, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== product.id));
      return true;
    }

    if (newQuantity > product.stockQuantity) {
      alert(`Cannot update quantity. Only ${product.stockQuantity} items are available in stock.`);
      return false;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      return [...prevItems, { product, quantity: newQuantity }];
    });
    return true;
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

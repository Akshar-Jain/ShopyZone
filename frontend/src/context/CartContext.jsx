import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext.jsx';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discountType, discountAmount }
  const [loading, setLoading] = useState(false);

  // Load cart items on user change
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          const res = await axios.get('/api/cart');
          setCartItems(res.data.items || []);
        } catch (err) {
          console.error('Failed to fetch user cart:', err.message);
        }
      } else {
        // Guest cart from local storage
        const localCart = localStorage.getItem('guest_cart');
        setCartItems(localCart ? JSON.parse(localCart) : []);
      }
      setLoading(false);
    };
    loadCart();
    // Clear coupon on user changes/logouts
    setCoupon(null);
  }, [user]);

  // Sync guest cart to local storage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // ADD TO CART
  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        await axios.post('/api/cart/add', { productId: product.id, quantity });
        // Refresh cart
        const res = await axios.get('/api/cart');
        setCartItems(res.data.items || []);
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to add item to cart.');
      }
    } else {
      // Local storage logic
      setCartItems(prev => {
        const existing = prev.find(item => item.product.id === product.id);
        if (existing) {
          const newQty = existing.quantity + quantity;
          if (newQty > product.stock) {
            throw new Error(`Only ${product.stock} items available in stock.`);
          }
          return prev.map(item =>
            item.product.id === product.id ? { ...item, quantity: newQty } : item
          );
        } else {
          if (quantity > product.stock) {
            throw new Error(`Only ${product.stock} items available in stock.`);
          }
          return [...prev, { product, quantity }];
        }
      });
    }
  };

  // UPDATE QUANTITY
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    if (user) {
      try {
        await axios.put('/api/cart/update', { productId, quantity });
        // Refresh cart
        const res = await axios.get('/api/cart');
        setCartItems(res.data.items || []);
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update quantity.');
      }
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product.id === productId ? { ...item, quantity: parseInt(quantity) } : item
        )
      );
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (productId) => {
    if (user) {
      try {
        await axios.delete('/api/cart/remove', { data: { productId } });
        // Refresh cart
        const res = await axios.get('/api/cart');
        setCartItems(res.data.items || []);
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to remove item.');
      }
    } else {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    }
  };

  // CLEAR CART
  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    if (!user) {
      localStorage.removeItem('guest_cart');
    }
  };

  // APPLY COUPON
  const applyCoupon = async (code) => {
    const subtotal = getSubtotal();
    try {
      const res = await axios.post('/api/orders/coupon/validate', { code, subtotal });
      setCoupon(res.data.coupon);
      return { success: true, message: res.data.message };
    } catch (err) {
      setCoupon(null);
      throw new Error(err.response?.data?.message || 'Failed to apply coupon.');
    }
  };

  // REMOVE COUPON
  const removeCoupon = () => {
    setCoupon(null);
  };

  // PRICE SUMMARY HELPERS
  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice ? parseFloat(item.product.discountPrice) : parseFloat(item.product.price);
      return sum + (price * item.quantity);
    }, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (coupon.discountType === 'percentage') {
      return subtotal * (coupon.discountAmount / 100);
    } else {
      return coupon.discountAmount;
    }
  };

  const getShipping = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 1000 ? 0 : 50; // free shipping over 1000
  };

  const getTotal = () => {
    const sub = getSubtotal();
    const disc = getDiscount();
    const ship = getShipping();
    return Math.max(0, sub - disc + ship);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getSubtotal,
        getDiscount,
        getShipping,
        getTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

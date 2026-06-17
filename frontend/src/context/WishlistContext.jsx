import React, { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  // Load wishlist from local storage on start
  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      try {
        setWishlistItems(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse wishlist from local storage', err);
      }
    }
  }, []);

  // Sync to local storage
  const saveWishlist = (items) => {
    setWishlistItems(items);
    localStorage.setItem('wishlist', JSON.stringify(items));
  };

  // TOGGLE WISHLIST
  const toggleWishlist = (product) => {
    const exists = wishlistItems.some(item => item.id === product.id);
    if (exists) {
      // Remove
      const filtered = wishlistItems.filter(item => item.id !== product.id);
      saveWishlist(filtered);
    } else {
      // Add
      saveWishlist([...wishlistItems, product]);
    }
  };

  // IS IN WISHLIST
  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

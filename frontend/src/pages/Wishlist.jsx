import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { WishlistContext } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';

const Wishlist = () => {
  const { wishlistItems } = useContext(WishlistContext);

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-theme-card border border-theme rounded-3xl p-12 text-center shadow-theme">
        <div className="p-4 bg-theme-primary text-rose-500 rounded-full mb-4">
          <Heart className="h-10 w-10 animate-pulse fill-rose-500" />
        </div>
        <h2 className="text-xl font-black text-theme-primary">Your Wishlist is Empty</h2>
        <p className="text-theme-secondary text-sm mt-1 max-w-xs leading-normal">
          Keep track of products you love. Pin them to your wishlist and they will show up here.
        </p>
        <Link
          to="/shop"
          className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-100 transition-colors inline-flex items-center gap-2"
        >
          <span>Discover Products</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight my-0 flex items-center gap-2">
        <Heart className="h-7 w-7 text-rose-500 fill-rose-500" />
        My Wishlist
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        {wishlistItems.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;

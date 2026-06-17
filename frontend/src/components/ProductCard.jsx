import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { toast } = useContext(ToastContext);

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const activePrice = product.discountPrice ? product.discountPrice : product.price;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (product.stock <= 0) {
        toast.error('Product is out of stock!');
        return;
      }
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist!');
  };

  return (
    <div className="group relative flex flex-col bg-theme-card backdrop-blur-md rounded-2xl overflow-hidden border border-theme hover:border-cyan-500/50 shadow-theme hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 transform hover:-translate-y-1">
      {/* Discount Badge */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-rose-500/90 text-white text-[9px] font-bold font-orbitron px-2.5 py-1 rounded-md uppercase tracking-wider border border-rose-400/20">
          -{discount}%
        </span>
      )}
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-xl border transition-all duration-300 focus:outline-none ${
          isWishlisted
            ? 'bg-rose-500/90 border-rose-400/30 text-white shadow-md shadow-rose-500/25'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-rose-500 hover:scale-105'
        }`}
      >
        <Heart className="h-4 w-4 fill-current" />
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.id}`} className="relative block w-full overflow-hidden aspect-square bg-slate-950/45 border-b border-slate-850">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
            <span className="bg-slate-900 text-slate-300 text-[10px] font-bold font-orbitron px-3 py-1.5 rounded-md uppercase tracking-widest border border-slate-800">
              SOLDOUT
            </span>
          </div>
        )}
      </Link>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          {product.brand && (
            <span className="text-[9px] text-cyan-400 font-bold font-orbitron uppercase tracking-widest block mb-1">
              {product.brand}
            </span>
          )}

          {/* Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-sm font-semibold text-theme-primary line-clamp-2 hover:text-cyan-400 transition-colors duration-200">
              {product.name}
            </h3>
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-xs font-bold text-theme-primary ml-1">{product.ratings || '0.0'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-theme-primary font-orbitron">₹{parseFloat(product.discountPrice).toLocaleString()}</span>
                <span className="text-xs text-slate-500 line-through font-orbitron">₹{parseFloat(product.price).toLocaleString()}</span>
              </div>
            ) : (
              <span className="text-base font-bold text-theme-primary font-orbitron">₹{parseFloat(product.price).toLocaleString()}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl transition-all duration-300 focus:outline-none flex items-center justify-center ${
              product.stock <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800/50'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/10 hover:shadow-cyan-500/20 border border-indigo-500/20 hover:border-cyan-400/30'
            }`}
            title="Add to Cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingBag, Heart, ShieldCheck, ChevronRight, MessageSquareCode } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';
import ProductCard from '../components/ProductCard.jsx';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
  const { toast } = useContext(ToastContext);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery states
  const [selectedImage, setSelectedImage] = useState('');
  
  // Cart quantity selector state
  const [quantity, setQuantity] = useState(1);
  
  // Review inputs
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductData = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      setProduct(res.data.product);
      setRelated(res.data.related);
      setSelectedImage(res.data.product.images[0] || '');
      setQuantity(1); // Reset quantity selector
    } catch (err) {
      console.error(err);
      toast.error('Product not found.');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProductData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return null;

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    try {
      if (product.stock <= 0) {
        toast.error('Product is out of stock!');
        return;
      }
      await addToCart(product, quantity);
      toast.success(`${product.name} (${quantity}) added to cart!`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Review comment cannot be empty.');
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(`/api/products/${product.id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      // Reload product details to show new review
      fetchProductData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/shop" className="hover:text-indigo-600">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/shop?categoryId=${product.categoryId}`} className="hover:text-indigo-600 truncate max-w-[120px]">
          {product.category?.name || 'Category'}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-600 truncate max-w-[180px]">{product.name}</span>
      </nav>

      {/* Main product column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-theme-card border border-theme rounded-3xl p-8 shadow-theme">
        
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-theme-primary border border-theme relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                <span className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-xl border border-slate-700 uppercase tracking-wider">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-theme-primary border transition-all ${
                    selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-500/15' : 'border-theme opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info details */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Header tags */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                {product.brand}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                product.stock > 0
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight leading-tight mt-2 mb-3">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4 w-4 ${idx < Math.floor(product.ratings) ? 'fill-current' : 'text-slate-200'}`}
                  />
                ))}
                <span className="text-sm font-bold text-theme-primary ml-1.5">{product.ratings || '0.0'}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-theme-secondary text-xs font-semibold uppercase tracking-wider">
                {product.reviewsCount} customer reviews
              </span>
            </div>

            {/* Price section */}
            <div className="mt-5 p-4 bg-theme-primary rounded-2xl border border-theme">
              <div className="flex items-baseline gap-2">
                {product.discountPrice ? (
                  <>
                    <span className="text-3xl font-black text-theme-primary">₹{parseFloat(product.discountPrice).toLocaleString()}</span>
                    <span className="text-sm text-theme-secondary line-through">₹{parseFloat(product.price).toLocaleString()}</span>
                    <span className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/25 px-2 py-0.5 rounded-md ml-2">
                      SAVE {discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-theme-primary">₹{parseFloat(product.price).toLocaleString()}</span>
                )}
              </div>
              <p className="text-[10px] text-theme-secondary mt-1 uppercase tracking-wider font-semibold">
                Inclusive of all taxes. Free shipping on orders over ₹1,000.
              </p>
            </div>

            {/* Description */}
            <p className="text-theme-secondary text-sm leading-relaxed mt-5">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-6 border-t border-theme">
            {product.stock > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-theme-secondary uppercase tracking-wider">Quantity:</span>
                <div className="flex border border-theme rounded-xl bg-theme-primary overflow-hidden">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-1.5 text-sm font-semibold hover:bg-theme-card text-theme-secondary"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-theme-primary flex items-center bg-theme-card border-x border-theme">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="px-3.5 py-1.5 text-sm font-semibold hover:bg-theme-card text-theme-secondary"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                <span>Add to Shopping Cart</span>
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product);
                  toast.success(isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist!');
                }}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center transition-all ${
                  isWishlisted
                    ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100'
                    : 'bg-theme-card border-theme text-theme-secondary hover:bg-theme-primary hover:text-rose-500'
                }`}
                title="Wishlist"
              >
                <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="bg-theme-card border border-theme rounded-3xl p-8 shadow-theme space-y-4">
          <h2 className="text-lg font-black text-theme-primary tracking-tight border-b border-theme pb-2 my-0">
            Technical Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b border-theme/30 py-2.5 text-sm">
                <span className="font-semibold text-theme-secondary">{key}</span>
                <span className="font-bold text-theme-primary text-right">{value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews & Submission */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Review summary info */}
        <div className="bg-theme-card border border-theme rounded-3xl p-6 shadow-theme h-fit space-y-4">
          <h2 className="text-lg font-black text-theme-primary tracking-tight border-b border-theme pb-2 my-0">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black text-theme-primary">{product.ratings || '0.0'}</span>
            <div className="space-y-1">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`h-4.5 w-4.5 ${idx < Math.floor(product.ratings) ? 'fill-current' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <p className="text-theme-secondary text-xs font-semibold uppercase tracking-wider">
                Based on {product.reviewsCount} ratings
              </p>
            </div>
          </div>

          {/* Form to submit review */}
          <div className="border-t border-theme pt-4 mt-4 space-y-3">
            <h3 className="font-bold text-theme-primary text-sm my-0">Write a Customer Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3 animate-fade-in">
                <div>
                  <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1">Rating:</span>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    className="bg-theme-primary border border-theme rounded-lg p-2 text-xs font-semibold text-theme-primary w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Good)</option>
                    <option value="3">3 Stars (Average)</option>
                    <option value="2">2 Stars (Poor)</option>
                    <option value="1">1 Star (Terrible)</option>
                  </select>
                </div>

                <div>
                  <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider block mb-1">Comment:</span>
                  <textarea
                    rows="3"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full bg-theme-primary border border-theme rounded-lg p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors border border-theme/20"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="bg-theme-primary border border-theme rounded-2xl p-4 text-center">
                <p className="text-xs text-theme-secondary leading-normal mb-3">
                  Please log in to submit your reviews and ratings.
                </p>
                <Link
                  to="/auth"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Review list */}
        <div className="lg:col-span-2 bg-theme-card border border-theme rounded-3xl p-6 shadow-theme space-y-4">
          <h2 className="text-lg font-black text-theme-primary tracking-tight border-b border-theme pb-2 my-0">
            Customer Reviews ({product.reviews?.length || 0})
          </h2>

          {product.reviews && product.reviews.length > 0 ? (
            <div className="divide-y divide-theme pr-2 max-h-[400px] overflow-y-auto">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2 border-theme/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-theme-primary text-sm my-0">{rev.user?.name}</h4>
                      <div className="flex text-amber-400 mt-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3 w-3 ${idx < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-theme-secondary">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-theme-secondary leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <MessageSquareCode className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium">No reviews yet</p>
              <p className="text-xs text-theme-secondary mt-0.5">Be the first to share your feedback for this product!</p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-theme pb-3">
            <h2 className="text-xl font-black text-theme-primary tracking-tight my-0">Related Products</h2>
            <p className="text-theme-secondary text-xs">Other products you might be interested in</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

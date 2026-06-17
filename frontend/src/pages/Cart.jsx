import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { CartContext } from '../context/CartContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';

const Cart = () => {
  const {
    cartItems,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
  } = useContext(CartContext);

  const { toast } = useContext(ToastContext);
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const res = await applyCoupon(couponCode);
      toast.success(res.message);
      setCouponCode('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.success('Coupon removed.');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-theme-card border border-theme rounded-3xl p-12 text-center shadow-theme">
        <div className="p-4 bg-theme-primary text-indigo-600 rounded-full mb-4">
          <ShoppingBag className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-xl font-black text-theme-primary">Your Cart is Empty</h2>
        <p className="text-theme-secondary text-sm mt-1 max-w-xs leading-normal">
          Looks like you haven't added anything to your cart yet. Head over to the shop and explore our premium collections.
        </p>
        <Link
          to="/shop"
          className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-100 transition-colors inline-flex items-center gap-2"
        >
          <span>Start Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight my-0">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            const product = item.product;
            const price = product.discountPrice ? parseFloat(product.discountPrice) : parseFloat(product.price);
            
            return (
              <div
                key={product.id}
                className="flex items-center gap-4 bg-theme-card border border-theme p-4 sm:p-5 rounded-2xl shadow-theme transition-all hover:border-cyan-500/35"
              >
                {/* Product Image */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 bg-theme-primary border border-theme rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Info & Quantity Controls */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="block text-sm font-semibold text-theme-primary hover:text-cyan-400 transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs font-bold text-theme-primary">
                      ₹{price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="flex items-center gap-4">
                    <div className="flex border border-theme rounded-xl bg-theme-primary overflow-hidden h-9">
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity - 1)}
                        className="px-3 hover:bg-theme-card text-theme-secondary text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 flex items-center bg-theme-card border-x border-theme text-xs font-bold text-theme-primary min-w-[36px] justify-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, item.quantity + 1)}
                        className="px-3 hover:bg-theme-card text-theme-secondary text-sm font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => {
                        removeFromCart(product.id);
                        toast.success('Removed from cart.');
                      }}
                      className="p-2 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Checkout Pricing Summary */}
        <div className="space-y-6">
          <div className="bg-theme-card border border-theme rounded-3xl p-6 shadow-theme space-y-4">
            <h3 className="font-black text-theme-primary text-base border-b border-theme pb-2 my-0">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-theme-secondary font-medium">
                <span>Subtotal</span>
                <span className="text-theme-primary font-semibold">₹{getSubtotal().toLocaleString()}</span>
              </div>

              {getDiscount() > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 fill-current" />
                    Coupon Discount
                  </span>
                  <span className="font-bold">- ₹{getDiscount().toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-secondary font-medium">
                <span>Shipping Fees</span>
                <span className="text-theme-primary font-semibold">
                  {getShipping() === 0 ? (
                    <span className="text-emerald-500 font-bold uppercase tracking-wider text-xs">FREE</span>
                  ) : (
                    `₹${getShipping()}`
                  )}
                </span>
              </div>

              <div className="border-t border-theme pt-3 flex justify-between text-theme-primary font-black text-base">
                <span>Total Amount</span>
                <span>₹{getTotal().toLocaleString()}</span>
              </div>
            </div>

            {/* Promo code entry */}
            <div className="border-t border-theme pt-4">
              {coupon ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 text-emerald-500 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Tag className="h-4 w-4 fill-emerald-100" />
                    <span>{coupon.code} Applied ({coupon.discountType === 'percentage' ? `${coupon.discountAmount}%` : `₹${coupon.discountAmount}`} off)</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-emerald-500 hover:text-emerald-700 p-0.5 rounded-full hover:bg-emerald-500/20">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs font-semibold uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponCode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-xs font-semibold disabled:bg-slate-800 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

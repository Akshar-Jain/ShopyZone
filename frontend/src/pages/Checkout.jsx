import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { ToastContext } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';
import { CheckCircle2, ClipboardList, Home, ArrowRight, ShieldCheck } from 'lucide-react';

const Checkout = () => {
  const { cartItems, coupon, getSubtotal, getDiscount, getShipping, getTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { toast } = useContext(ToastContext);

  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zip: '',
  });

  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // stores order response

  // Pre-fill address from user profile if available
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        name: user.name || '',
      }));
      if (user.addresses && user.addresses.length > 0) {
        // Use the first saved address by default
        const addr = user.addresses[0];
        setShippingAddress({
          name: user.name,
          phone: addr.phone || '',
          addressLine: addr.addressLine || '',
          city: addr.city || '',
          state: addr.state || '',
          zip: addr.zip || '',
        });
      }
    }
  }, [user]);

  // If cart is empty and order is not placed yet, send back to cart
  useEffect(() => {
    if (cartItems.length === 0 && !placedOrder) {
      navigate('/cart');
    }
  }, [cartItems, placedOrder, navigate]);

  const handleInputChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handleSavedAddressSelect = (addr) => {
    setShippingAddress({
      name: user.name,
      phone: addr.phone || '',
      addressLine: addr.addressLine || '',
      city: addr.city || '',
      state: addr.state || '',
      zip: addr.zip || '',
    });
    toast.success('Address pre-filled!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Route guard check in place
    if (!user) {
      toast.warning('Please log in to place an order.');
      navigate('/auth', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip
    ) {
      toast.error('All shipping address fields are required.');
      return;
    }

    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await axios.post('/api/orders/place', {
        items,
        shippingAddress,
        couponCode: coupon?.code,
      });

      setPlacedOrder(res.data.order);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Render Order Confirmation screen if placed
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-fade-in">
        <div className="bg-theme-card border border-theme rounded-3xl p-8 shadow-theme space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <CheckCircle2 className="h-10 w-10 fill-emerald-500/5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-theme-primary tracking-tight my-0">Order Confirmed!</h1>
            <p className="text-theme-secondary text-sm">
              Thank you for your purchase. Your order details are registered below.
            </p>
          </div>

          <div className="bg-theme-primary border border-theme rounded-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center border-b border-theme/30 pb-2">
              <span className="text-xs text-theme-secondary font-bold uppercase tracking-wider">Order ID</span>
              <span className="text-sm font-mono font-bold text-indigo-500">{placedOrder.orderId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-theme-secondary font-bold uppercase tracking-wider">Total Amount Paid</span>
              <span className="text-sm font-bold text-theme-primary">₹{placedOrder.totals.total.toLocaleString()}</span>
            </div>

            <div className="border-t border-theme/35 pt-3 text-xs text-theme-secondary leading-relaxed">
              <span className="font-bold text-theme-primary uppercase block mb-1">Shipping Address:</span>
              <p className="m-0 font-medium">
                {placedOrder.shippingAddress.name} <br />
                {placedOrder.shippingAddress.addressLine}, {placedOrder.shippingAddress.city}, <br />
                {placedOrder.shippingAddress.state} - {placedOrder.shippingAddress.zip} <br />
                Phone: {placedOrder.shippingAddress.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders"
              className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
            >
              <ClipboardList className="h-4.5 w-4.5" />
              Track Order Status
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 px-6 bg-theme-primary hover:bg-theme-card text-theme-secondary font-semibold rounded-xl text-sm flex items-center justify-center gap-2 border border-theme"
            >
              <Home className="h-4.5 w-4.5" />
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight my-0">
        Checkout Shipping Details
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form: Shipping Address */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Saved Addresses list (if logged in & has addresses) */}
          {user && user.addresses && user.addresses.length > 0 && (
            <div className="bg-theme-card border border-theme p-6 rounded-3xl shadow-theme space-y-3">
              <h3 className="font-bold text-theme-primary text-sm my-0">Use Saved Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.addresses.map((addr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSavedAddressSelect(addr)}
                    className="text-left border border-theme hover:border-indigo-500 rounded-xl p-3.5 hover:bg-indigo-500/10 transition-colors text-xs font-medium text-theme-secondary space-y-1"
                  >
                    <p className="font-bold text-theme-primary m-0 truncate">{addr.addressLine}</p>
                    <p className="m-0 truncate">{addr.city}, {addr.state} - {addr.zip}</p>
                    <p className="m-0 font-mono">Ph: {addr.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-theme-card border border-theme p-6 rounded-3xl shadow-theme">
            <h3 className="font-bold text-theme-primary text-sm mb-6 border-b border-theme pb-2 my-0">
              Delivery Address
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recipient Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={shippingAddress.name}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="9876543210"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  name="addressLine"
                  required
                  placeholder="Flat No, House Name, Street Details"
                  value={shippingAddress.addressLine}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Mumbai"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  name="state"
                  required
                  placeholder="Maharashtra"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zip"
                  required
                  placeholder="400001"
                  value={shippingAddress.zip}
                  onChange={handleInputChange}
                  className="w-full bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-theme-primary"
                />
              </div>

              {/* simulated payment details */}
              <div className="sm:col-span-2 border-t border-theme pt-6 mt-4 space-y-3">
                <h3 className="font-bold text-theme-primary text-sm my-0 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Simulated Payment
                </h3>
                <p className="text-xs text-theme-secondary leading-normal">
                  ShopyZone uses simulated payment processing. No actual transaction fees or credit cards are needed. Clicking 'Place Order' will instantly register the transaction.
                </p>
              </div>

              <div className="sm:col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-colors"
                >
                  <span>Place Order (Simulated Payment)</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Panel: Order Items Summary */}
        <div className="space-y-6">
          <div className="bg-theme-card border border-theme rounded-3xl p-6 shadow-theme space-y-4">
            <h3 className="font-black text-theme-primary text-base border-b border-theme pb-2 my-0">
              Items Summary
            </h3>

            <div className="divide-y divide-theme/30 max-h-[220px] overflow-y-auto pr-2">
              {cartItems.map((item) => {
                const price = item.product.discountPrice ? parseFloat(item.product.discountPrice) : parseFloat(item.product.price);
                return (
                  <div key={item.product.id} className="py-2.5 first:pt-0 last:pb-0 flex gap-3 text-xs font-semibold text-theme-secondary border-theme/20">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-10 w-10 object-cover rounded-md border border-theme bg-theme-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate m-0 text-theme-primary font-bold">{item.product.name}</p>
                      <p className="text-theme-secondary mt-0.5 m-0 font-medium">Qty: {item.quantity} × ₹{price.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-theme pt-3 space-y-2 text-xs font-semibold">
              <div className="flex justify-between text-theme-secondary">
                <span>Subtotal</span>
                <span className="text-theme-primary">₹{getSubtotal().toLocaleString()}</span>
              </div>
              
              {getDiscount() > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span>
                  <span>- ₹{getDiscount().toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-theme-secondary">
                <span>Shipping</span>
                <span className="text-theme-primary">
                  {getShipping() === 0 ? 'FREE' : `₹${getShipping()}`}
                </span>
              </div>

              <div className="border-t border-theme pt-3 flex justify-between text-theme-primary font-black text-sm">
                <span>Total</span>
                <span className="text-indigo-600 text-base">₹{getTotal().toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;

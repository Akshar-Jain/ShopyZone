import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';
import { ClipboardList, ChevronDown, ChevronUp, PackageCheck, Truck, ShoppingCart, Calendar } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  const { toast } = useContext(ToastContext);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/history');
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl sm:text-3xl font-black text-theme-primary tracking-tight my-0 flex items-center gap-2.5">
        <ClipboardList className="h-7 w-7 text-indigo-600" />
        Order History & Status
      </h1>

      {orders.length === 0 ? (
        <div className="bg-theme-card border border-theme rounded-3xl p-12 text-center shadow-theme">
          <PackageCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-theme-primary font-sans">No Orders Found</h3>
          <p className="text-theme-secondary text-sm mt-1 max-w-xs mx-auto">
            You haven't placed any orders yet. Once you complete a purchase, your order history will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusColors = {
              pending: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
              shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
              delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
              cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
            };

            return (
              <div
                key={order.id}
                className="bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-theme transition-all duration-200"
              >
                {/* Order Header Summary */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 cursor-pointer hover:bg-theme-primary/40 transition-colors"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
                      <span className="text-sm font-bold font-mono text-theme-primary">{order.orderId}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Placed On</span>
                      <span className="text-sm font-semibold text-theme-primary flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Amount</span>
                      <span className="text-sm font-black text-theme-primary">₹{order.totals.total.toLocaleString()}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Status</span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        statusColors[order.orderStatus]
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details: Items list and tracking history */}
                {isExpanded && (
                  <div className="border-t border-theme bg-theme-primary/30 p-5 space-y-6 animate-fade-in">
                    
                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider my-0">Purchased Items</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 bg-theme-card p-3 rounded-xl border border-theme shadow-xs">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-12 w-12 object-cover rounded-lg border border-theme bg-theme-primary flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-theme-primary truncate m-0">{item.name}</p>
                              <p className="text-[11px] text-theme-secondary mt-0.5 m-0 font-semibold">
                                Price: ₹{item.price.toLocaleString()} | Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address Summary */}
                    <div className="text-xs text-theme-secondary font-medium">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Shipping Details</span>
                      <p className="m-0 leading-relaxed font-semibold text-theme-primary">
                        {order.shippingAddress.name} ({order.shippingAddress.phone}) <br />
                        {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                      </p>
                    </div>

                    {/* tracking timeline view */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider my-0">Delivery Timeline</h4>
                      
                      <div className="relative border-l border-indigo-500/20 ml-4 space-y-4">
                        {order.trackingUpdates.map((update, idx) => (
                          <div key={idx} className="relative pl-6">
                            {/* Dot icon indicator */}
                            <span className="absolute -left-2.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/25">
                              {update.status === 'pending' && <ShoppingCart className="h-3 w-3 text-indigo-600" />}
                              {update.status === 'shipped' && <Truck className="h-3 w-3 text-indigo-600" />}
                              {update.status === 'delivered' && <PackageCheck className="h-3 w-3 text-emerald-600" />}
                              {update.status === 'cancelled' && <PackageCheck className="h-3 w-3 text-rose-600" />}
                            </span>
                            <div className="text-xs space-y-0.5 font-semibold text-theme-primary">
                              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">
                                {update.status.toUpperCase()} — {new Date(update.date).toLocaleDateString()} {new Date(update.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <p className="m-0 text-theme-secondary font-medium leading-relaxed">{update.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

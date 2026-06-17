import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Users,
  Tag,
  Plus,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Package,
  Edit,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
  const { toast } = useContext(ToastContext);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'categories', 'orders', 'users'
  const [loading, setLoading] = useState(true);

  // Stats & Chart state
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, pendingOrders: 0, sales: 0 });
  const [chartData, setChartData] = useState([]);

  // Products Management state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    discountPrice: '',
    stock: '',
    categoryId: '',
    description: '',
    images: '',
    specifications: '',
    isFeatured: false,
    isActive: true
  });

  // Category Management state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: ''
  });

  // Orders Management state
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState(''); // '' (all), 'pending', 'shipped', 'delivered', 'cancelled'

  // Users Management state
  const [users, setUsers] = useState([]);

  // Search/Filters inside tabs
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');

  // Fetch admin dashboard details
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
      setChartData(res.data.chartData);
    } catch (err) {
      toast.error('Failed to load dashboard statistics.');
    }
  };

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (productSearch) params.append('search', productSearch);
      if (productCategoryFilter) params.append('categoryId', productCategoryFilter);
      
      const res = await axios.get(`/api/admin/products?${params.toString()}`);
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products list.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error('Failed to load categories.');
    }
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (orderFilter) params.append('status', orderFilter);
      
      const res = await axios.get(`/api/admin/orders?${params.toString()}`);
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users.');
    }
  };

  const initAdminData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchProducts(),
      fetchCategories(),
      fetchOrders(),
      fetchUsers()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    initAdminData();
  }, []);

  // Trigger product fetch when search/filter inputs change
  useEffect(() => {
    fetchProducts();
  }, [productSearch, productCategoryFilter]);

  // Trigger orders fetch when filter changes
  useEffect(() => {
    fetchOrders();
  }, [orderFilter]);

  // 1. PRODUCTS CRUD OPERATIONS
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm({
      ...productForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditProductClick = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      brand: prod.brand || '',
      price: prod.price,
      discountPrice: prod.discountPrice || '',
      stock: prod.stock,
      categoryId: prod.categoryId,
      description: prod.description,
      images: prod.images.join(', '),
      specifications: JSON.stringify(prod.specifications || {}, null, 2),
      isFeatured: prod.isFeatured,
      isActive: prod.isActive !== undefined ? prod.isActive : true
    });
    setShowProductModal(true);
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: '',
      price: '',
      discountPrice: '',
      stock: '',
      categoryId: categories[0]?.id || '',
      description: '',
      images: '',
      specifications: '{\n  "Warranty": "1 Year"\n}',
      isFeatured: false,
      isActive: true
    });
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Parse images
    const imageList = productForm.images
      ? productForm.images.split(',').map(img => img.trim()).filter(Boolean)
      : [];

    // Parse specs
    let specs = {};
    try {
      specs = JSON.parse(productForm.specifications || '{}');
    } catch (err) {
      toast.error('Invalid JSON in Specifications.');
      return;
    }

    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      discountPrice: productForm.discountPrice ? parseFloat(productForm.discountPrice) : null,
      stock: parseInt(productForm.stock),
      images: imageList,
      specifications: specs
    };

    try {
      if (editingProduct) {
        await axios.put(`/api/admin/products/${editingProduct.id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await axios.post('/api/admin/products', payload);
        toast.success('Product added successfully!');
      }
      setShowProductModal(false);
      fetchProducts();
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    }
  };

  const handleToggleProductActive = async (id) => {
    try {
      const res = await axios.put(`/api/admin/products/${id}/toggle`);
      toast.success(res.data.message);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to toggle product status.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      toast.success('Product deleted.');
      fetchProducts();
      fetchDashboardStats();
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  // 2. CATEGORY CRUD OPERATIONS
  const handleCategoryInputChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', image: '' });
    setShowCategoryModal(true);
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || ''
    });
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/api/admin/categories/${editingCategory.id}`, categoryForm);
        toast.success('Category updated successfully!');
      } else {
        await axios.post('/api/admin/categories', categoryForm);
        toast.success('Category added successfully!');
      }
      setShowCategoryModal(false);
      fetchCategories();
      fetchDashboardStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? All products under it will remain but won\'t be associated.')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      toast.success('Category deleted.');
      fetchCategories();
      fetchDashboardStats();
    } catch (err) {
      toast.error('Failed to delete category.');
    }
  };

  // 3. ORDER STATUS UPDATE
  const handleOrderStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`/api/admin/orders/${id}/status`, { status: newStatus });
      toast.success('Order status updated!');
      fetchOrders();
      fetchDashboardStats();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // 4. BLOCK/UNBLOCK USER
  const handleToggleUserBlock = async (id, currentBlocked) => {
    try {
      await axios.put(`/api/admin/users/${id}/block`, { block: !currentBlocked });
      toast.success(`User ${!currentBlocked ? 'blocked' : 'unblocked'} successfully.`);
      fetchUsers();
      fetchDashboardStats();
    } catch (err) {
      toast.error('Failed to update user block state.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[75vh]">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full lg:w-60 flex-shrink-0 bg-theme-card border border-theme rounded-3xl p-5 shadow-theme h-fit space-y-2">
        <div className="px-3 py-2 border-b border-theme/30 mb-3">
          <p className="text-[10px] text-theme-secondary font-bold uppercase tracking-wider">Control Panel</p>
          <h2 className="text-sm font-black text-theme-primary m-0 font-orbitron">Store Manager</h2>
        </div>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard Stats
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Manage Products
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
          }`}
        >
          <Tag className="h-4 w-4" />
          Manage Categories
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Manage Orders
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
          }`}
        >
          <Users className="h-4 w-4" />
          User Records
        </button>
      </aside>

      {/* Main Admin Panels Area */}
      <div className="flex-1 min-w-0 bg-theme-card border border-theme rounded-3xl p-6 sm:p-8 shadow-theme">
        
        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-theme-primary border border-theme p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Total Revenue</span>
                  <span className="text-base sm:text-lg font-black text-theme-primary font-mono">₹{stats.sales.toLocaleString()}</span>
                </div>
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-theme-primary border border-theme p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Total Orders</span>
                  <span className="text-base sm:text-lg font-black text-theme-primary">{stats.orders}</span>
                </div>
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl">
                  <Package className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-theme-primary border border-theme p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Pending Orders</span>
                  <span className="text-base sm:text-lg font-black text-theme-primary">{stats.pendingOrders}</span>
                </div>
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl">
                  <ClipboardList className="h-5 w-5" />
                </div>
              </div>

              <div className="bg-theme-primary border border-theme p-5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider block">Total Users</span>
                  <span className="text-base sm:text-lg font-black text-theme-primary">{stats.users}</span>
                </div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              {/* Sales Chart */}
              <div className="space-y-3">
                <h4 className="font-bold text-theme-primary text-xs flex items-center gap-1.5 uppercase tracking-wider font-orbitron">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Monthly Revenue Trend (₹)
                </h4>
                <div className="h-72 w-full bg-theme-primary rounded-2xl border border-theme p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Bar Chart */}
              <div className="space-y-3">
                <h4 className="font-bold text-theme-primary text-xs flex items-center gap-1.5 uppercase tracking-wider font-orbitron">
                  <Package className="h-4 w-4 text-blue-500" />
                  Monthly Orders Count
                </h4>
                <div className="h-72 w-full bg-theme-primary rounded-2xl border border-theme p-4 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Orders Ledger */}
            <div className="space-y-3 pt-4">
              <h4 className="font-bold text-theme-primary text-xs uppercase tracking-wider font-orbitron">Recent Orders Ledger</h4>
              <div className="overflow-x-auto border border-theme rounded-2xl shadow-sm">
                <table className="w-full border-collapse text-left text-xs font-semibold text-theme-primary">
                  <thead className="bg-theme-primary border-b border-theme text-[10px] text-theme-secondary uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme/30 bg-theme-card">
                    {orders.slice(0, 5).map(ord => (
                      <tr key={ord.id} className="hover:bg-theme-primary/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-400">{ord.orderId}</td>
                        <td className="p-4 font-medium text-theme-secondary">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-black text-theme-primary">₹{parseFloat(ord.totals.total).toLocaleString()}</td>
                        <td className="p-4"><span className="text-emerald-500 font-bold uppercase">PAID</span></td>
                        <td className="p-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
                            ord.orderStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                            ord.orderStatus === 'shipped' ? 'bg-blue-500/10 text-blue-500 border-blue-500/25' :
                            ord.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                            'bg-rose-500/10 text-rose-500 border-rose-500/25'
                          }`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-theme pb-4 gap-4">
              <div>
                <h3 className="font-black text-theme-primary text-lg my-0 font-orbitron">Inventory Catalog</h3>
                <p className="text-theme-secondary text-xs mt-0.5">Manage details, pricing, stock limits, and active visibility status.</p>
              </div>
              <button
                onClick={handleAddProductClick}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by product name or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="flex-1 bg-theme-primary border border-theme rounded-xl px-4 py-2 text-xs focus:outline-none text-theme-primary font-semibold"
              />
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="bg-theme-primary border border-theme rounded-xl px-4 py-2 text-xs text-theme-secondary focus:outline-none cursor-pointer font-semibold"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto border border-theme rounded-2xl shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-semibold text-theme-primary">
                <thead className="bg-theme-primary border-b border-theme text-[10px] text-theme-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Visibility</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/30 bg-theme-card">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-theme-primary/40 transition-colors">
                      <td className="p-4 max-w-[200px] truncate font-bold text-theme-primary">{prod.name}</td>
                      <td className="p-4 font-medium text-theme-secondary">{prod.brand || '—'}</td>
                      <td className="p-4 font-medium text-theme-secondary">{prod.category?.name}</td>
                      <td className="p-4 font-black text-theme-primary">₹{parseFloat(prod.price).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`font-bold ${prod.stock <= 5 ? 'text-rose-500' : 'text-theme-primary'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleProductActive(prod.id)}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider cursor-pointer transition-colors ${
                            prod.isActive !== false
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/25 text-rose-500 hover:bg-rose-500/20'
                          }`}
                        >
                          {prod.isActive !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditProductClick(prod)}
                            className="p-1.5 border border-theme rounded-lg text-theme-secondary hover:text-indigo-400 hover:border-indigo-500/35 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 border border-theme rounded-lg text-theme-secondary hover:text-rose-500 hover:border-rose-500/35 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-theme pb-4">
              <div>
                <h3 className="font-black text-theme-primary text-lg my-0 font-orbitron">Product Categories</h3>
                <p className="text-theme-secondary text-xs mt-0.5">Manage e-commerce store catalog departments and banners.</p>
              </div>
              <button
                onClick={handleAddCategoryClick}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </div>

            {/* Categories Table */}
            <div className="overflow-x-auto border border-theme rounded-2xl shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-semibold text-theme-primary">
                <thead className="bg-theme-primary border-b border-theme text-[10px] text-theme-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Image</th>
                    <th className="p-4">Category Name</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/30 bg-theme-card">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-theme-primary/40 transition-colors">
                      <td className="p-4">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-9 w-9 object-cover rounded-lg border border-theme" />
                        ) : (
                          <div className="h-9 w-9 bg-theme-primary rounded-lg border border-theme flex items-center justify-center text-theme-secondary text-[10px]">No Pic</div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-theme-primary">{cat.name}</td>
                      <td className="p-4 font-mono text-[10px] text-indigo-400">{cat.slug}</td>
                      <td className="p-4 font-medium text-theme-secondary max-w-[240px] truncate">{cat.description || '—'}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditCategoryClick(cat)}
                            className="p-1.5 border border-theme rounded-lg text-theme-secondary hover:text-indigo-400 hover:border-indigo-500/35 transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 border border-theme rounded-lg text-theme-secondary hover:text-rose-500 hover:border-rose-500/35 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-theme pb-4 gap-4">
              <div>
                <h3 className="font-black text-theme-primary text-lg my-0 font-orbitron">Fulfillment Center</h3>
                <p className="text-theme-secondary text-xs mt-0.5">View transaction logs, customer details, and dispatch statuses.</p>
              </div>

              {/* Order Filter Select */}
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="bg-theme-primary border border-theme rounded-xl px-4 py-2.5 text-xs text-theme-secondary focus:outline-none cursor-pointer font-semibold"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="out for delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto border border-theme rounded-2xl shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-semibold text-theme-primary">
                <thead className="bg-theme-primary border-b border-theme text-[10px] text-theme-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Current Status</th>
                    <th className="p-4 text-center">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/30 bg-theme-card">
                  {orders.map(ord => (
                    <tr key={ord.id} className="hover:bg-theme-primary/40 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-400">{ord.orderId}</td>
                      <td className="p-4">
                        <div className="font-bold text-theme-primary">{ord.user?.name || '—'}</div>
                        <div className="text-[10px] text-theme-secondary font-medium">{ord.user?.email || '—'}</div>
                      </td>
                      <td className="p-4 font-bold text-theme-primary">
                        {ord.shippingAddress?.name || 'Customer'}
                      </td>
                      <td className="p-4 font-medium text-theme-secondary">{new Date(ord.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-black text-theme-primary font-mono">₹{parseFloat(ord.totals.total).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          ord.orderStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/25' :
                          ord.orderStatus === 'shipped' ? 'bg-blue-500/10 text-blue-500 border-blue-500/25' :
                          ord.orderStatus === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/25'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          className="bg-theme-primary border border-theme rounded-lg p-1 text-[11px] font-semibold text-theme-secondary cursor-pointer focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out for delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: USER RECORDS */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="font-black text-theme-primary text-lg my-0 font-orbitron">Customer Directory</h3>
              <p className="text-theme-secondary text-xs mt-0.5">View user credentials, customer join dates, total orders, and block access.</p>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-theme rounded-2xl shadow-sm">
              <table className="w-full border-collapse text-left text-xs font-semibold text-theme-primary">
                <thead className="bg-theme-primary border-b border-theme text-[10px] text-theme-secondary uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Join Date</th>
                    <th className="p-4 text-center">Order Count</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/30 bg-theme-card">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-theme-primary/40 transition-colors">
                      <td className="p-4 font-bold text-theme-primary">{u.name}</td>
                      <td className="p-4 font-medium text-theme-secondary">{u.email}</td>
                      <td className="p-4 font-medium text-theme-secondary">
                        {u.joinDate ? new Date(u.joinDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4 text-center font-bold text-theme-primary">
                        {u.orderCount || 0} orders
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block h-2 w-2 rounded-full border ${
                          u.isBlocked
                            ? 'bg-rose-500 border-rose-600 animate-pulse'
                            : 'bg-emerald-500 border-emerald-600'
                        }`} title={u.isBlocked ? 'Blocked' : 'Active'}></span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleUserBlock(u.id, u.isBlocked)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 mx-auto transition-colors border cursor-pointer ${
                            u.isBlocked
                              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 border-rose-500/25 text-rose-500 hover:bg-rose-500/20'
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="h-3.5 w-3.5" /> Unblock User
                            </>
                          ) : (
                            <>
                              <Lock className="h-3.5 w-3.5" /> Block User
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-theme-card border border-theme rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme">
              <h3 className="text-base font-black text-theme-primary my-0 font-orbitron">
                {editingProduct ? `Edit Product (ID: ${editingProduct.id})` : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1.5 text-theme-secondary hover:text-theme-primary rounded-xl hover:bg-theme-primary/50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={productForm.name}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Brand Name</label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Regular Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={productForm.price}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Discount Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="discountPrice"
                    value={productForm.discountPrice}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Stock Inventory</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    value={productForm.stock}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Product Category</label>
                  <select
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs text-theme-primary cursor-pointer focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Image URLs (comma-separated list)</label>
                  <textarea
                    rows="2"
                    name="images"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                    value={productForm.images}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl p-3 text-xs focus:outline-none text-theme-primary"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Description</label>
                  <textarea
                    rows="3"
                    name="description"
                    required
                    value={productForm.description}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl p-3 text-xs focus:outline-none text-theme-primary animate-none"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Technical Specifications (JSON format)</label>
                  <textarea
                    rows="4"
                    name="specifications"
                    required
                    value={productForm.specifications}
                    onChange={handleProductInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl p-3 text-xs font-mono focus:outline-none text-theme-primary"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={productForm.isFeatured}
                    onChange={handleProductInputChange}
                    className="h-4.5 w-4.5 text-indigo-600 border-theme rounded focus:ring-indigo-500 bg-theme-primary animate-none"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-theme-secondary uppercase tracking-wider cursor-pointer select-none">
                    Feature on Homepage (Featured Product)
                  </label>
                </div>

                <div className="sm:col-span-2 flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isActiveProduct"
                    name="isActive"
                    checked={productForm.isActive}
                    onChange={handleProductInputChange}
                    className="h-4.5 w-4.5 text-indigo-600 border-theme rounded focus:ring-indigo-500 bg-theme-primary animate-none"
                  />
                  <label htmlFor="isActiveProduct" className="text-xs font-bold text-theme-secondary uppercase tracking-wider cursor-pointer select-none">
                    Publish Immediately (Active Status)
                  </label>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="border-t border-theme pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary/80 border border-theme text-theme-primary rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-theme-card border border-theme rounded-3xl w-full max-w-lg shadow-2xl flex flex-col animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-theme">
              <h3 className="text-base font-black text-theme-primary my-0 font-orbitron">
                {editingCategory ? `Edit Category (ID: ${editingCategory.id})` : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 text-theme-secondary hover:text-theme-primary rounded-xl hover:bg-theme-primary/50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4 text-left">
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={categoryForm.name}
                    onChange={handleCategoryInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Image Banner URL</label>
                  <input
                    type="text"
                    name="image"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={categoryForm.image}
                    onChange={handleCategoryInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs focus:outline-none text-theme-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">Description</label>
                  <textarea
                    rows="3"
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryInputChange}
                    className="w-full bg-theme-primary border border-theme rounded-xl p-3 text-xs focus:outline-none text-theme-primary"
                  ></textarea>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="border-t border-theme pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary/80 border border-theme text-theme-primary rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save Category
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  UserCircle,
  Sun,
  Moon,
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { CartContext } from '../context/CartContext.jsx';
import { WishlistContext } from '../context/WishlistContext.jsx';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const { wishlistItems } = useContext(WishlistContext);
  
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchMobileRef = useRef(null);
  const userMenuRef = useRef(null);

  // Fetch categories for navbar
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Suggestions API call
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await axios.get(`/api/products/suggestions?query=${searchQuery}`);
          setSuggestions(res.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside listener for search & user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inDesktopSearch = searchRef.current && searchRef.current.contains(e.target);
      const inMobileSearch = searchMobileRef.current && searchMobileRef.current.contains(e.target);
      if (!inDesktopSearch && !inMobileSearch) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/shop?search=${searchQuery}`);
  };

  const handleSuggestionClick = (val) => {
    setSearchQuery(val);
    setShowSuggestions(false);
    navigate(`/shop?search=${val}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen bg-theme-primary text-theme-primary transition-colors duration-300">
      
      {/* Glassmorphic Sticky Header */}
      <header className="sticky top-0 z-50 bg-[var(--header-bg)] backdrop-blur-xl border-b border-theme shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-cyan-400 rounded-md focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo - Cyber styled */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl sm:text-2xl font-black font-orbitron bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent tracking-widest">
                SHOPYZONE
              </span>
            </Link>

            {/* Autocomplete Search Bar */}
            <div ref={searchRef} className="hidden md:block flex-1 max-w-lg relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-theme-card border border-theme rounded-xl pl-4 pr-10 py-2 text-xs focus:bg-theme-primary focus:outline-none focus:ring-2 focus:ring-cyan-500/25 focus:border-cyan-500 text-theme-primary transition-all duration-300 font-semibold"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-cyan-400 focus:outline-none">
                  <Search className="h-4.5 w-4.5" />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-theme-primary border border-theme rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in py-1">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-theme-card border-b border-theme/30 last:border-b-0 text-theme-primary hover:text-cyan-400 flex items-center gap-2.5 transition-colors duration-150 font-medium"
                    >
                      <Search className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Icons Navigation */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Category Links */}
              <Link
                to="/shop"
                className="hidden lg:flex items-center gap-1 text-xs font-bold font-orbitron uppercase tracking-widest text-slate-300 hover:text-cyan-400 transition-colors duration-200"
              >
                Shop
              </Link>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-slate-900/50 relative transition-all duration-200"
                title="Wishlist"
              >
                <Heart className="h-4.5 w-4.5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center border border-slate-950 shadow-sm shadow-rose-500/30 font-orbitron">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                to="/cart"
                className="p-2.5 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-slate-900/50 relative transition-all duration-200"
                title="Cart"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                {getCartCount() > 0 && (
                  <span className="absolute top-1 right-1 bg-cyan-500 text-slate-950 text-[8px] font-black h-3.5 w-3.5 rounded-full flex items-center justify-center border border-slate-950 shadow-sm shadow-cyan-500/30 font-orbitron">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* Theme Toggle Icon */}
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-slate-900/50 transition-all duration-200 focus:outline-none cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              {/* User Dropdown */}
              <div ref={userMenuRef} className="relative">
                {user ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-900 transition-colors duration-200 focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs font-orbitron shadow-inner shadow-cyan-500/5">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-theme-primary border border-theme rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in py-1">
                        <div className="px-4 py-2.5 border-b border-theme/20">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">My Account</p>
                          <p className="text-xs font-semibold text-theme-primary truncate font-orbitron">{user.name}</p>
                        </div>

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider font-orbitron text-slate-400 hover:bg-theme-card hover:text-cyan-400 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider font-orbitron text-slate-400 hover:bg-theme-card hover:text-cyan-400 transition-colors"
                        >
                          <UserCircle className="h-4 w-4" />
                          My Profile
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider font-orbitron text-slate-400 hover:bg-theme-card hover:text-cyan-400 transition-colors"
                        >
                          <ClipboardList className="h-4 w-4" />
                          My Orders
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider font-orbitron text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-theme/20 text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Log Out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-orbitron uppercase tracking-widest bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all duration-200 shadow-md shadow-cyan-500/10 hover:shadow-cyan-400/25"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>

            </div>
          </div>

          {/* Search bar on mobile */}
          <div ref={searchMobileRef} className="md:hidden pb-3 relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-theme-card border border-theme rounded-xl pl-4 pr-10 py-1.5 text-xs text-theme-primary focus:outline-none focus:ring-1 focus:ring-cyan-500/30 font-semibold"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Mobile Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-theme-primary border border-theme rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-theme-card border-b border-theme/30 last:border-b-0 text-theme-primary hover:text-cyan-400 flex items-center gap-2.5 transition-colors duration-150 font-medium cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-theme-primary pt-5 pb-4 border-r border-theme shadow-2xl animate-fade-in">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none text-white hover:text-cyan-400"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 flex items-center">
              <span className="text-lg font-black font-orbitron text-cyan-400 tracking-widest">SHOPYZONE</span>
            </div>

            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider font-orbitron text-slate-300 hover:bg-slate-900 hover:text-cyan-400"
                >
                  Home
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-bold uppercase tracking-wider font-orbitron text-slate-300 hover:bg-slate-900 hover:text-cyan-400"
                >
                  Shop
                </Link>
                
                <div className="border-t border-slate-900 my-2 pt-2">
                  <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-orbitron">Product Categories</p>
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/shop?categoryId=${cat.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-6 py-1.5 rounded-md text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-cyan-400"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-theme-card-solid border-t border-theme text-theme-secondary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-theme-primary font-orbitron font-black text-base tracking-widest mb-4 uppercase">ShopyZone</h3>
            <p className="text-xs leading-relaxed font-medium text-theme-secondary">
              Next-generation modern storefront. Providing premium electronics, trendy fashion wear, and home essentials.
            </p>
          </div>
          <div>
            <h4 className="text-theme-primary text-xs font-bold font-orbitron mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/shop" className="hover:text-cyan-400 transition-colors text-theme-secondary">Shop</Link></li>
              <li><Link to="/wishlist" className="hover:text-cyan-400 transition-colors text-theme-secondary">Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-cyan-400 transition-colors text-theme-secondary">Shopping Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-theme-primary text-xs font-bold font-orbitron mb-4 uppercase tracking-wider">Support</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/orders" className="hover:text-cyan-400 transition-colors text-theme-secondary">Order History</Link></li>
              <li><Link to="/faq" className="hover:text-cyan-400 transition-colors text-theme-secondary">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-cyan-400 transition-colors text-theme-secondary">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-theme/20 text-center text-[10px] uppercase font-bold tracking-wider text-theme-secondary">
          <p>© {new Date().getFullYear()} ShopyZone E-Commerce. Synchronized with database.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

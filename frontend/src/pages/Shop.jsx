import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { SlidersHorizontal, Star, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState(['SoundMaster', 'FitTech', 'UrbanStyle', 'AeroStride', 'KitchenArt', 'Penguin Books']);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Read URL search params
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brand = searchParams.get('brand') || '';
  const minRating = searchParams.get('minRating') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Input states for price inputs to prevent lag on keystroke
  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  // Reset inputs when URL params change
  useEffect(() => {
    setPriceRange({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  // Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get('/api/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when query params change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('categoryId', categoryId);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (brand) params.append('brand', brand);
        if (minRating) params.append('minRating', minRating);
        if (sort) params.append('sort', sort);
        params.append('page', page.toString());
        params.append('limit', '8');

        const res = await axios.get(`/api/products?${params.toString()}`);
        setProducts(res.data.products);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, categoryId, minPrice, maxPrice, brand, minRating, sort, page]);

  // Update query params helper
  const updateQuery = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (priceRange.min) newParams.set('minPrice', priceRange.min);
    else newParams.delete('minPrice');
    
    if (priceRange.max) newParams.set('maxPrice', priceRange.max);
    else newParams.delete('maxPrice');

    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setPriceRange({ min: '', max: '' });
  };

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', pageNum.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filter Panel */}
      <aside className="w-full lg:w-64 flex-shrink-0 bg-theme-card backdrop-blur-md border border-theme rounded-2xl p-6 shadow-theme h-fit space-y-6">
        <div className="flex items-center justify-between border-b border-theme pb-3">
          <h3 className="font-bold text-theme-primary flex items-center gap-2 text-sm uppercase tracking-wider font-orbitron my-0">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            Filters
          </h3>
          <button
            onClick={handleResetFilters}
            className="text-[10px] font-bold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors uppercase tracking-wider font-orbitron"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>

        {/* Category Filter */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron my-0">Category</h4>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => updateQuery('categoryId', '')}
              className={`text-left text-xs py-1.5 px-3 rounded-lg transition-colors font-semibold uppercase tracking-wider font-orbitron ${
                !categoryId ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateQuery('categoryId', cat.id.toString())}
                className={`text-left text-xs py-1.5 px-3 rounded-lg transition-colors font-semibold uppercase tracking-wider font-orbitron ${
                  categoryId === cat.id.toString()
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                    : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron my-0">Price Range (₹)</h4>
          <form onSubmit={handlePriceApply} className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="w-full bg-theme-primary border border-theme rounded-lg p-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 text-theme-primary"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="w-full bg-theme-primary border border-theme rounded-lg p-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-cyan-500 text-theme-primary"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/30 rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              Go
            </button>
          </form>
        </div>

        {/* Brand Filter */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron my-0">Brand</h4>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => updateQuery('brand', '')}
              className={`text-left text-xs py-1.5 px-3 rounded-lg transition-colors font-semibold uppercase tracking-wider font-orbitron ${
                !brand ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
              }`}
            >
              All Brands
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => updateQuery('brand', b)}
                className={`text-left text-xs py-1.5 px-3 rounded-lg transition-colors font-semibold uppercase tracking-wider font-orbitron ${
                  brand === b ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'text-theme-secondary hover:bg-theme-primary hover:text-theme-primary'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Ratings Filter */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-orbitron my-0">Customer Ratings</h4>
          <div className="flex flex-col gap-1">
            {[4, 3, 2].map((stars) => (
              <button
                key={stars}
                onClick={() => updateQuery('minRating', stars.toString())}
                className={`flex items-center gap-2 text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors font-medium ${
                  minRating === stars.toString() ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400' : 'text-theme-secondary hover:bg-theme-primary'
                }`}
              >
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-3 w-3 ${idx < stars ? 'fill-current' : 'text-slate-800'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold font-orbitron text-slate-400">& UP</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Product Grid Area */}
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* Top bar controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-theme-card backdrop-blur-md border border-theme p-4 rounded-2xl shadow-theme">
          <div>
            <p className="text-xs font-bold font-orbitron uppercase tracking-wider text-theme-primary">
              Found <span className="text-cyan-400 font-black">{totalCount}</span> products
            </p>
            {search && (
              <p className="text-xs text-theme-secondary mt-1 m-0 font-medium">
                Search results for: <span className="font-semibold text-theme-primary">"{search}"</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <span className="text-[10px] text-theme-secondary font-bold uppercase tracking-widest font-orbitron">Sort By</span>
            <select
              value={sort}
              onChange={(e) => updateQuery('sort', e.target.value)}
              className="bg-theme-primary border border-theme rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500 text-theme-primary cursor-pointer flex-1 sm:flex-none font-orbitron uppercase"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : products.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center shadow-md">
            <SlidersHorizontal className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold font-orbitron uppercase tracking-wider text-slate-200">No Products Found</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
              No products matched your search criteria. Try modifying your filters or search term.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold font-orbitron uppercase tracking-widest shadow-md shadow-indigo-600/10 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-9 w-9 rounded-xl border text-xs font-bold font-orbitron transition-all focus:outline-none ${
                        page === pNum
                          ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="p-2 border border-slate-800 rounded-xl hover:bg-slate-900 text-slate-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors focus:outline-none"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;

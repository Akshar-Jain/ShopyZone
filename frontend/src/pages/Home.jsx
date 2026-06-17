import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, ChevronLeft, ChevronRight, Star, ShoppingBag, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { LoadingSpinner } from '../components/ProtectedRoute.jsx';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel Banner States
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=450',
      title: 'Next-Gen Audio & Smart Tech',
      subtitle: 'Up to 50% off on headphones and smartwatches.',
      link: '/shop?categoryId=1'
    },
    {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200&h=450',
      title: 'Revamp Your Wardrobe',
      subtitle: 'Trendy fashion wear, jackets, hoodies & sneakers.',
      link: '/shop?categoryId=2'
    },
    {
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200&h=450',
      title: 'Daily Essentials & Groceries',
      subtitle: 'Artisanal cookies, premium teas, spices, and more.',
      link: '/shop?categoryId=5'
    }
  ];

  // Auto-play slider
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/products?limit=8&sort=oldest')
        ]);
        setCategories(catsRes.data);
        setFeaturedProducts(prodsRes.data.products);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8 pb-8 -mt-8">
      {/* Category Sub-Navbar Link Bar (Amazon-Style) */}
      <div className="w-screen bg-slate-900/95 dark:bg-slate-950/90 text-slate-300 py-2.5 px-4 sm:px-8 border-b border-slate-800 flex items-center justify-start gap-5 overflow-x-auto relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] select-none text-xs font-semibold uppercase tracking-wider font-orbitron">
        <Link to="/shop" className="hover:text-cyan-400 whitespace-nowrap">All Departments</Link>
        <Link to="/shop?categoryId=1" className="hover:text-cyan-400 whitespace-nowrap">Electronics</Link>
        <Link to="/shop?categoryId=2" className="hover:text-cyan-400 whitespace-nowrap">Fashion</Link>
        <Link to="/shop?categoryId=3" className="hover:text-cyan-400 whitespace-nowrap">Home & Kitchen</Link>
        <Link to="/shop?categoryId=4" className="hover:text-cyan-400 whitespace-nowrap">Books</Link>
        <Link to="/shop?categoryId=5" className="hover:text-cyan-400 whitespace-nowrap">Groceries</Link>
        <Link to="/shop?categoryId=6" className="hover:text-cyan-400 whitespace-nowrap">Wrappers & Shipping</Link>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400 whitespace-nowrap cursor-pointer hover:text-cyan-300">Today's Deals</span>
      </div>

      {/* Hero Banner Carousel (Amazon-Style) */}
      <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[30vh] sm:h-[45vh] lg:h-[55vh] min-h-[280px] sm:min-h-[380px] lg:min-h-[480px] overflow-hidden select-none group">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Dark gradient overlay that fades to bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-900/90 dark:to-slate-950 z-10"></div>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute top-6 sm:top-12 lg:top-16 left-6 sm:left-16 max-w-lg z-20 space-y-2 sm:space-y-4 text-white">
              <h1 className="text-xl sm:text-4xl lg:text-5xl font-black font-orbitron tracking-wide leading-tight drop-shadow-md my-0">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-slate-200 font-medium drop-shadow-sm leading-normal">
                {slide.subtitle}
              </p>
              <Link
                to={slide.link}
                className="inline-block px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 dark:text-white font-bold font-orbitron rounded-xl text-[10px] uppercase tracking-widest shadow-lg transition-transform active:scale-95 border border-cyan-400/20"
              >
                Explore Deals
              </Link>
            </div>
          </div>
        ))}
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/50 hover:bg-slate-950 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-950/50 hover:bg-slate-950 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* Amazon-Style Multi-Card Grid Overlay */}
      <section className="relative z-30 -mt-16 sm:-mt-28 lg:-mt-44 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        
        {/* Card 1: Appliances & Electronics */}
        <div className="bg-theme-card border border-theme rounded-2xl p-5 shadow-theme flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-theme-primary font-orbitron uppercase tracking-wide my-0">Appliances & Electronics</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link to="/product/1" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200" alt="Headphones" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Headphones</p>
              </Link>
              <Link to="/product/2" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200" alt="Smartwatch" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Smartwatch</p>
              </Link>
              <Link to="/product/7" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=200" alt="Mouse" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Wireless Mouse</p>
              </Link>
              <Link to="/product/8" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=200" alt="Laptop Stand" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Laptop Stand</p>
              </Link>
            </div>
          </div>
          <Link to="/shop?categoryId=1" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-orbitron block mt-2">See more deals</Link>
        </div>

        {/* Card 2: Revamp your style | Fashion */}
        <div className="bg-theme-card border border-theme rounded-2xl p-5 shadow-theme flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-theme-primary font-orbitron uppercase tracking-wide my-0">Revamp Your Style</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link to="/product/3" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200" alt="Jacket" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Leather Jacket</p>
              </Link>
              <Link to="/product/4" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200" alt="Sneakers" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Sneakers</p>
              </Link>
              <Link to="/product/9" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=200" alt="Hoodie" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Pullover Hoodie</p>
              </Link>
              <Link to="/product/10" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=200" alt="Sunglasses" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Sunglasses</p>
              </Link>
            </div>
          </div>
          <Link to="/shop?categoryId=2" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-orbitron block mt-2">See more deals</Link>
        </div>

        {/* Card 3: Home Essentials */}
        <div className="bg-theme-card border border-theme rounded-2xl p-5 shadow-theme flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-theme-primary font-orbitron uppercase tracking-wide my-0">Deals on Home Essentials</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link to="/product/5" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200" alt="Ceramic Mug" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Mug Set</p>
              </Link>
              <Link to="/product/11" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=200" alt="Kettle" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Electric Kettle</p>
              </Link>
              <Link to="/product/12" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=200" alt="Pots" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Succulent Pots</p>
              </Link>
              <Link to="/shop?categoryId=3" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=200" alt="Kitchen Decor" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Kitchen Decor</p>
              </Link>
            </div>
          </div>
          <Link to="/shop?categoryId=3" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-orbitron block mt-2">See more deals</Link>
        </div>

        {/* Card 4: Packaging & Foods */}
        <div className="bg-theme-card border border-theme rounded-2xl p-5 shadow-theme flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-base text-theme-primary font-orbitron uppercase tracking-wide my-0">Packaging & Foods</h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Link to="/shop?categoryId=6" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=200" alt="Gift Wrapper" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Gift Wraps</p>
              </Link>
              <Link to="/shop?categoryId=6" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200" alt="Bubble Wrap" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Bubble Wrap</p>
              </Link>
              <Link to="/shop?categoryId=5" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=200" alt="Cookies" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Choco Cookies</p>
              </Link>
              <Link to="/shop?categoryId=5" className="group">
                <div className="aspect-square bg-slate-100 dark:bg-slate-950 rounded-xl overflow-hidden p-1 border border-theme">
                  <img src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=200" alt="Gourmet Coffee" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <p className="text-[10px] text-theme-secondary font-semibold text-center mt-1 group-hover:text-cyan-400">Gourmet Coffee</p>
              </Link>
            </div>
          </div>
          <Link to="/shop?categoryId=5" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider font-orbitron block mt-2">See more deals</Link>
        </div>

      </section>

      {/* Featured Products List */}
      <section className="space-y-6 max-w-7xl mx-auto px-4 pt-12">
        <div className="flex items-end justify-between border-b border-theme pb-3">
          <div>
            <h2 className="text-xl font-bold font-orbitron uppercase tracking-widest text-theme-primary my-0">Trending Recommendations</h2>
            <p className="text-theme-secondary text-xs mt-0.5">Top recommended products for you</p>
          </div>
          <Link
            to="/shop"
            className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs font-orbitron uppercase tracking-widest flex items-center gap-1 group"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

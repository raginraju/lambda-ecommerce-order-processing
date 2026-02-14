import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, MapPin, Loader2, ShoppingCart } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import ProductScroll from './ProductScroll';
import axios from 'axios';



const Home = () => {
  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const isLocal = window.location.hostname === 'localhost';

  // Get the URL directly from Vite's env
  // If Vite is in 'development' mode, it uses .env.local; in 'production', it uses .env.production
  const cdnUrl = import.meta.env.VITE_CDN_URL || '';
  
  // State for dynamic products and loading status
  const [featuredCuts, setFeaturedCuts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 2. Use the variable directly. 
        // In Dev, it's https://d3fxvx62oe0ul5.cloudfront.net
        // In Prod, it can be empty '' to use relative paths
        const response = await axios.get(`${cdnUrl}/data/products.json`);
        
        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data?.products;
  
        setFeaturedCuts(data || []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setFeaturedCuts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleQuickAdd = (product) => {
    // Uses the first available cut option if it exists, else defaults to STANDARD_CUT
    const defaultCut = product.cuts && product.cuts.length > 0 
      ? product.cuts[0] 
      : "STANDARD_CUT";
      
    addToCart(product, 1.0, defaultCut);
  };

  return (
    <>
      <div className="min-h-screen pb-24 bg-earth-50">
        {/* Reusable Navbar Component */}
        <Navbar onOpenCart={() => setIsCartOpen(true)} />

        {/* Hero Section */}
        <section className="px-6 py-8">
          <div className="bg-earth-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <span className="text-butcher-400 font-bold uppercase tracking-widest text-[10px]">Fresh Daily Arrival</span>
              <h1 className="text-4xl font-black font-heading mt-2 leading-tight uppercase tracking-tighter">
                Artisanal <br/>Broiler Chicken
              </h1>
              <p className="text-earth-300 mt-4 text-sm max-w-[200px] font-medium italic">
                Hand-cut, organic, and delivered within hours.
              </p>
              <button 
                onClick={() => navigate('/products')}
                className="mt-6 bg-butcher-700 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-butcher-800 transition-all shadow-lg active:scale-95"
              >
                Shop Collection <ChevronRight size={16} />
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-butcher-700/20 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Featured Cuts Horizontal Scroll with Loading Logic */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-butcher-700" size={40} />
            <p className="text-earth-400 font-bold uppercase tracking-widest text-[10px]">Loading Fresh Stock...</p>
          </div>
        ) : (
          <ProductScroll 
            title="Featured Cuts"
            subtitle="Sourced from Local Farms"
            items={featuredCuts}
            onAdd={handleQuickAdd}
            onViewAll={() => navigate('/products')}
          />
        )}

        {/* Brand Standards Section */}
        <section className="px-6 mt-10">
          <div className="glass-card rounded-[2rem] p-8 border-white shadow-2xl space-y-8">
            <h3 className="font-heading font-black text-2xl uppercase tracking-tighter">The Block Standards</h3>
            <div className="space-y-6">
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 bg-butcher-50 rounded-2xl flex items-center justify-center text-butcher-700 shrink-0 shadow-sm border border-butcher-100">
                  <Star size={24} fill="currentColor"/>
                </div>
                <div>
                  <p className="font-black text-earth-900 text-sm uppercase tracking-tight">Certified Organic</p>
                  <p className="text-xs text-earth-400 leading-relaxed font-medium">
                    Our broiler birds are raised without hormones or antibiotics, ensuring pure farm flavor.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 bg-earth-100 rounded-2xl flex items-center justify-center text-earth-900 shrink-0 shadow-sm border border-earth-200">
                  <MapPin size={24}/>
                </div>
                <div>
                  <p className="font-black text-earth-900 text-sm uppercase tracking-tight">Local Delivery</p>
                  <p className="text-xs text-earth-400 leading-relaxed font-medium">
                    Serving the Bendemeer community with fresh cuts delivered directly to your kitchen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Cart Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Home;
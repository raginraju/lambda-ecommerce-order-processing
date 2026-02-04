import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  ChevronRight, 
  Star, 
  MapPin 
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import ProductScroll from './ProductScroll'; // New Import

const Home = () => {
  const { cartCount, addToCart } = useCart();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const featuredCuts = [
    { 
      id: "PROD-001", 
      name: "Whole Broiler Chicken", 
      price: 12.50, 
      unit: "kg", 
      image: "/images/products/WHOLE_CHICKEN.jpg"
    },
    { 
      id: "PROD-002", 
      name: "Premium Biryani Cut", 
      price: 14.00, 
      unit: "kg", 
      image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=crop&w=400" 
    },
    { 
      id: "PROD-003", 
      name: "Fresh Chicken Wings", 
      price: 8.50, 
      unit: "pk", 
      image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?auto=format&fit=croop&w=400" 
    }
  ];

  const handleQuickAdd = (product) => {
    addToCart(product, 1.0, "STANDARD_CUT");
  };

  return (
    <>
      <div className="min-h-screen pb-24 bg-earth-50">
        <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-8 h-8 bg-butcher-700 rounded-lg rotate-3 flex items-center justify-center shadow-md">
              <span className="text-white font-black">B</span>
            </div>
            <span className="text-xl font-black font-heading tracking-tighter text-earth-900 uppercase">The Block</span>
          </div>
          
          <div className="flex gap-4 items-center">
            <Search size={20} className="text-earth-400 cursor-not-allowed" />
            <div className="relative cursor-pointer hover:scale-110 transition-transform" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={22} className="text-earth-900" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-butcher-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </nav>

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

        {/* REUSABLE SCROLL COMPONENT */}
        <ProductScroll 
          title="Featured Cuts"
          subtitle="Sourced from Local Farms"
          items={featuredCuts}
          onAdd={handleQuickAdd}
          onViewAll={() => navigate('/products')}
        />

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

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Home;
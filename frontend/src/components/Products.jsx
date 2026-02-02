import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Minus, Info, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Products = () => {
  const { addToCart, cartCount } = useCart();
  const navigate = useNavigate();
  const [weight, setWeight] = useState(1.0);
  const [selectedCut, setSelectedCut] = useState("BIRYANI_CUT");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Specific cuts tailored to your Poultry Shop project
  const cuts = [
    { id: "WHOLE", label: "Whole Chicken", price: 12.50 },
    { id: "BIRYANI_CUT", label: "Biryani Cut", price: 13.50 },
    { id: "CURRY_CUT", label: "Curry Cut", price: 13.50 },
    { id: "DRUMSTICKS", label: "Drumsticks", price: 15.00 },
    { id: "BONELESS", label: "Boneless Breast", price: 18.00 }
  ];

  const currentPrice = cuts.find(c => c.id === selectedCut)?.price || 12.50;

  const handleAddToCart = () => {
    const product = {
      id: "PROD-001", 
      name: "Farm-Fresh Broiler Chicken",
      basePrice: currentPrice,
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800"
    };
    
    addToCart(product, weight, selectedCut);
    setIsCartOpen(true); // Open drawer to show the item was added
  };

  return (
    <>
      <div className="min-h-screen bg-earth-50 pb-40">
        {/* Navigation Overlay */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
          <button 
            onClick={() => navigate('/home')}
            className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white pointer-events-auto active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} className="text-earth-900" />
          </button>
          <div 
            className="relative w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white pointer-events-auto cursor-pointer active:scale-90 transition-transform"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={20} className="text-earth-900" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-butcher-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
                {cartCount}
              </span>
            )}
          </div>
        </nav>

        {/* Product Hero Image */}
        <div className="relative h-80 w-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800" 
            alt="Fresh Broiler" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-earth-50 to-transparent opacity-60"></div>
        </div>

        {/* Product Details Section */}
        <div className="px-6 -mt-12 relative z-10">
          <div className="glass-card rounded-[2.5rem] p-8 shadow-2xl border-white bg-white/80">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck size={14} className="text-butcher-600" />
                   <span className="text-butcher-700 font-black uppercase tracking-widest text-[10px]">Premium Broiler Grade</span>
                </div>
                <h1 className="text-4xl font-black font-heading text-earth-900 leading-none uppercase tracking-tighter">Farm-Fresh Chicken</h1>
              </div>
              <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                <Info size={12} /> FRESHLY CUT
              </div>
            </div>

            <p className="text-earth-500 text-sm leading-relaxed mb-8 font-medium italic">
              Raised without hormones. Sourced daily for the Bendemeer community. 
              Hand-butchered and vacuum sealed within the hour.
            </p>

            {/* Cut Style Selection Grid */}
            <div className="mb-10">
              <label className="text-xs font-black text-earth-400 uppercase tracking-widest block mb-5 ml-1 italic">1. Choose Your Cut Style</label>
              <div className="grid grid-cols-2 gap-4">
                {cuts.map((cut) => (
                  <button
                    key={cut.id}
                    onClick={() => setSelectedCut(cut.id)}
                    className={`py-5 px-4 rounded-[1.5rem] text-xs font-bold transition-all border-2 flex flex-col items-center gap-1 shadow-sm ${
                      selectedCut === cut.id 
                      ? 'border-butcher-700 bg-butcher-50 text-butcher-700 ring-4 ring-butcher-50' 
                      : 'border-white bg-white/50 text-earth-400'
                    }`}
                  >
                    <span className="uppercase tracking-tight">{cut.label}</span>
                    <span className="text-[10px] opacity-60 font-black">${cut.price.toFixed(2)}/kg</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Adjustment Selector */}
            <div className="space-y-4">
              <label className="text-xs font-black text-earth-400 uppercase tracking-widest block ml-1 italic">2. Set Quantity (Weight)</label>
              <div className="flex justify-between items-center bg-earth-100/30 p-5 rounded-[2rem] border border-earth-100/50">
                <span className="font-black text-earth-900 uppercase tracking-tighter">Total Weight</span>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setWeight(Math.max(0.5, weight - 0.5))}
                    className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-butcher-700 shadow-md border border-earth-100 active:scale-90 transition-all"
                  >
                    <Minus size={20} strokeWidth={3} />
                  </button>
                  <div className="text-center min-w-[60px]">
                    <span className="text-2xl font-black text-earth-900">{weight.toFixed(1)}</span>
                    <span className="text-[10px] font-bold text-earth-400 block uppercase tracking-widest">kg</span>
                  </div>
                  <button 
                    onClick={() => setWeight(weight + 0.5)}
                    className="w-12 h-12 bg-butcher-700 rounded-2xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The Checkout Bar - Floating Action */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-earth-50 via-earth-50/90 to-transparent z-40">
          <div className="glass-card rounded-[2.5rem] p-6 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.1)] border-white flex items-center justify-between max-w-2xl mx-auto">
            <div className="pl-2">
              <p className="text-[10px] font-black text-earth-400 uppercase tracking-widest mb-1 italic">Estimated Total</p>
              <p className="text-3xl font-black text-butcher-700 font-heading leading-none">
                ${(weight * currentPrice).toFixed(2)}
              </p>
            </div>
            <button 
              onClick={handleAddToCart}
              className="bg-earth-900 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl hover:bg-butcher-800 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              <ShoppingCart size={20} strokeWidth={2.5} /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer Component */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Products;
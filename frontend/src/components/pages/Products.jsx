import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Grid, List, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from "@/context/CartContext";
import { Navbar, CartDrawer} from '@/components/ui';

// --- Sub-component: ListViewItem with Dropdown ---
const ListViewItem = ({ product, onAdd }) => {
  const [selectedCut, setSelectedCut] = useState(
    product.cuts && product.cuts.length > 0 ? product.cuts[0] : "STANDARD_CUT"
  );

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-[1.8rem] shadow-sm border border-white hover:shadow-md transition-all active:scale-[0.98]">
      <img 
        src={product.image} 
        className="w-20 h-20 object-cover rounded-2xl shrink-0 shadow-sm" 
        alt={product.name} 
      />
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <h3 className="font-black uppercase tracking-tight text-sm text-earth-900">{product.name}</h3>
          <span className="text-[8px] bg-earth-100 px-2 py-0.5 rounded-full font-bold text-earth-500 uppercase">{product.category}</span>
        </div>
        
        {/* Dropdown for List View */}
        {product.cuts && product.cuts.length > 0 && (
          <select 
            value={selectedCut}
            onChange={(e) => setSelectedCut(e.target.value)}
            className="mt-1 bg-transparent text-[9px] font-bold uppercase text-earth-400 focus:outline-none cursor-pointer"
          >
            {product.cuts.map(cut => (
              <option key={cut} value={cut}>{cut.replace('_', ' ')}</option>
            ))}
          </select>
        )}
        
        <p className="text-butcher-700 font-black text-lg mt-1">${product.price}<span className="text-[10px] text-earth-400 ml-1">/kg</span></p>
      </div>
      <button 
        onClick={() => onAdd(product, 1.0, selectedCut)}
        className="bg-earth-900 text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-transform"
      >
        <ShoppingCart size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// --- Main Products Component ---
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const cdnUrl = import.meta.env.VITE_CDN_URL || '';

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await axios.get(`${cdnUrl}/data/products.json`);
        const data = Array.isArray(response.data) ? response.data : response.data?.products;
        setProducts(data || []);
      } catch (error) {
        console.error("Failed to load collection:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [cdnUrl]);

  // Clean and add to cart logic
  const handleAddToCart = (product, qty, cut) => {
    const safePrice = Number(product.price) || 0;
    const cleanProduct = {
      ...product,
      price: safePrice,
      name: product.name || "Unknown Cut",
      image: product.image || "https://via.placeholder.com/150"
    };
    addToCart(cleanProduct, qty, cut);
  };

  return (
    <div className="min-h-screen bg-earth-50 pb-32">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-earth-400 font-bold text-[10px] uppercase tracking-widest mb-2 hover:text-butcher-700 transition-colors">
              <ArrowLeft size={12} /> Back to Home
            </button>
            <h1 className="text-4xl font-black font-heading uppercase tracking-tighter text-earth-900 leading-none">Full Collection</h1>
          </div>

          <div className="flex bg-earth-200/50 p-1.5 rounded-[1.2rem] border border-earth-200 backdrop-blur-sm">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-tighter ${viewMode === 'grid' ? 'bg-white shadow-md text-butcher-700' : 'text-earth-400'}`}>
              <Grid size={18} /> <span className="hidden md:inline">Grid</span>
            </button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-tighter ${viewMode === 'list' ? 'bg-white shadow-md text-butcher-700' : 'text-earth-400'}`}>
              <List size={18} /> <span className="hidden md:inline">List</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-butcher-700" size={48} />
            <p className="text-earth-400 font-bold uppercase tracking-widest text-[10px]">Updating Butcher's Case...</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4 max-w-3xl mx-auto"}>
            {products.map(product => (
              viewMode === 'grid' ? (
                <GridCard key={product.id} product={product} onAdd={handleAddToCart} />
              ) : (
                <ListViewItem key={product.id} product={product} onAdd={handleAddToCart} />
              )
            ))}
          </div>
        )}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

// --- Sub-component: GridCard with Dropdown ---
const GridCard = ({ product, onAdd }) => {
  const [selectedCut, setSelectedCut] = useState(
    product.cuts && product.cuts.length > 0 ? product.cuts[0] : "STANDARD_CUT"
  );

  return (
    <div className="glass-card rounded-[2.5rem] p-6 bg-white shadow-xl border-white hover:scale-[1.02] transition-all duration-300 group">
      <div className="relative h-56 w-full mb-6 overflow-hidden rounded-[1.8rem] shadow-inner">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase text-earth-900 shadow-sm">
          {product.category}
        </div>
      </div>
      
      {/* Grid View Dropdown */}
      {product.cuts && product.cuts.length > 0 && (
        <div className="relative mb-4">
          <select 
            value={selectedCut}
            onChange={(e) => setSelectedCut(e.target.value)}
            className="w-full bg-earth-50 border border-earth-100 text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-xl appearance-none cursor-pointer focus:outline-none"
          >
            {product.cuts.map(cut => (
              <option key={cut} value={cut}>{cut.replace('_', ' ')}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-black uppercase tracking-tight text-xl text-earth-900 mb-1">{product.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-butcher-700">${product.price}</span>
            <span className="text-[10px] font-bold text-earth-400 uppercase">/kg</span>
          </div>
        </div>
        <button 
          onClick={() => onAdd(product, 1.0, selectedCut)}
          className="bg-earth-900 text-white p-5 rounded-[1.5rem] shadow-2xl active:scale-90 transition-all hover:bg-butcher-800"
        >
          <ShoppingCart size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Products;
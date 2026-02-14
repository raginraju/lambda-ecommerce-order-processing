import React, { useState } from 'react';
import { ShoppingCart, ChevronDown } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
  // Default to the first cut if available, otherwise a standard string
  const [selectedCut, setSelectedCut] = useState(
    product.cuts && product.cuts.length > 0 ? product.cuts[0] : "STANDARD_CUT"
  );

  const hasCuts = product.cuts && product.cuts.length > 0;

  return (
    <div className="w-64 shrink-0 glass-card rounded-[2rem] p-5 bg-white shadow-xl border-white hover:scale-[1.02] transition-transform flex flex-col">
      {/* Product Image */}
      <div className="relative h-40 w-full mb-4 overflow-hidden rounded-2xl shadow-inner">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase text-earth-900 shadow-sm">
          {product.category || 'Premium'}
        </div>
      </div>

      {/* Product Info */}
      <div className="mb-4">
        <h3 className="font-black uppercase tracking-tight text-earth-900 text-lg leading-tight">
          {product.name}
        </h3>
        
        {/* Conditional Dropdown for Cuts */}
        {hasCuts ? (
          <div className="relative mt-2">
            <select 
              value={selectedCut}
              onChange={(e) => setSelectedCut(e.target.value)}
              className="w-full bg-earth-50 border border-earth-100 text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-butcher-700/20"
            >
              {product.cuts.map((cut) => (
                <option key={cut} value={cut}>
                  {cut.replace('_', ' ')}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 pointer-events-none" />
          </div>
        ) : (
          <p className="text-earth-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">
            Standard Cut
          </p>
        )}
      </div>

      {/* Price and Add Button */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-earth-50">
        <div>
          <span className="text-2xl font-black text-butcher-700">
            ${Number(product.price).toFixed(2)}
          </span>
          <span className="text-[10px] font-bold text-earth-400 block -mt-1 uppercase">/kg</span>
        </div>
        
        <button 
          onClick={() => onAdd({ ...product }, 1.0, selectedCut)}
          className="bg-earth-900 text-white p-3.5 rounded-2xl shadow-lg active:scale-90 transition-all hover:bg-butcher-800"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
import React from 'react';
import { ShoppingCart } from 'lucide-react'; // Import the icon

const ProductCard = ({ product, onAdd }) => {
  return (
    <div className="w-64 shrink-0 glass-card rounded-[2rem] p-5 bg-white shadow-xl border-white hover:scale-[1.02] transition-transform">
      {/* Product Image */}
      <div className="relative h-40 w-full mb-4 overflow-hidden rounded-2xl">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <h3 className="font-black uppercase tracking-tight text-earth-900 text-lg mb-1">
        {product.name}
      </h3>
      <p className="text-earth-400 text-[10px] font-bold uppercase tracking-widest mb-4 italic">
        {product.category || 'Premium Cut'}
      </p>

      {/* Price and Add Button */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-2xl font-black text-butcher-700">
            ${product.price}
          </span>
          <span className="text-[10px] font-bold text-earth-400 block -mt-1 uppercase">/kg</span>
        </div>
        
        {/* THE CHANGE: Add the ShoppingCart button here */}
        <button 
          onClick={() => onAdd(product)}
          className="bg-earth-900 text-white p-3.5 rounded-2xl shadow-lg active:scale-90 transition-all hover:bg-butcher-800"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
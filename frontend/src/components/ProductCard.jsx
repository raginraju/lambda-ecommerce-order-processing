import React from 'react';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAdd, onClick }) => {
  return (
    <div className="min-w-[220px] bg-white rounded-[2rem] p-4 shadow-xl shadow-earth-200/50 border border-white">
      <div className="cursor-pointer group" onClick={onClick}>
        <div className="overflow-hidden rounded-2xl mb-4 aspect-square">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        <h3 className="font-bold text-sm text-earth-900 uppercase tracking-tight line-clamp-1">
          {product.name}
        </h3>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <span className="text-butcher-700 font-black text-lg">
          ${product.price.toFixed(2)} 
          <span className="text-[10px] text-earth-300 font-bold ml-1 uppercase tracking-tighter">
            / {product.unit}
          </span>
        </span>
        <button 
          onClick={() => onAdd(product)}
          className="w-10 h-10 bg-earth-900 text-white rounded-2xl flex items-center justify-center hover:bg-butcher-700 transition-all active:scale-90 shadow-md"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
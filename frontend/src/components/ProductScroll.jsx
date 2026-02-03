import React from 'react';
import ProductCard from './ProductCard';

const ProductScroll = ({ title, subtitle, items, onAdd, onViewAll }) => {
  return (
    <div className="my-8">
      {/* Header Section */}
      <section className="px-6 py-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black font-heading text-earth-900 uppercase tracking-tighter">
            {title}
          </h2>
          {subtitle && (
            <p className="text-earth-400 text-[10px] font-bold uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-butcher-700 font-bold text-xs border-b-2 border-butcher-700 pb-0.5 uppercase tracking-tighter"
          >
            View All
          </button>
        )}
      </section>

      {/* Scrollable Area */}
      <section className="px-6 overflow-x-auto flex gap-6 no-scrollbar py-4">
        {items.map((item) => (
          <ProductCard 
            key={item.id} 
            product={item} 
            onAdd={onAdd} 
            onClick={onViewAll} // Or a specific product detail route
          />
        ))}
      </section>
    </div>
  );
};

export default ProductScroll;
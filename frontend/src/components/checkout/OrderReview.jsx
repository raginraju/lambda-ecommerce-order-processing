import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const OrderReview = () => {
  // Accessing the cart state and modifier functions directly from context
  const { cart, addToCart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <section className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-earth-100 text-center">
        <p className="text-earth-400 font-medium italic">Your basket is currently empty.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-earth-100">
      <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tighter mb-8">
        Review Your Cuts
      </h2>
      
      <div className="divide-y divide-earth-100">
        {cart.map((item) => {
          const { id, name, image, price, quantity, cutType } = item;
          // Calculate individual item total
          const itemTotal = (Number(price || 0) * quantity).toFixed(2);

          return (
            <div key={id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row items-center gap-6 group">
              {/* Product Thumbnail */}
              <div className="relative shrink-0">
                <img 
                  src={image} 
                  className="w-24 h-24 object-cover rounded-2xl shadow-sm border border-earth-50" 
                  alt={name} 
                />
              </div>
              
              {/* Product Details */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-black text-earth-900 uppercase text-lg leading-tight">
                  {name}
                </h4>
                <p className="text-[10px] text-butcher-700 font-bold uppercase tracking-widest mt-1">
                  {cutType ? cutType.replace('_', ' ') : 'DO NOT CUT'}
                </p>
              </div>

              {/* Controls Wrapper */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                
                {/* Weight/Quantity Controls */}
                <div className="flex items-center gap-4 bg-earth-50 px-4 py-2 rounded-full border border-earth-100 shadow-inner">
                  <button 
                    onClick={() => addToCart(item, -0.5, cutType)}
                    disabled={quantity <= 0.5}
                    className="text-earth-400 hover:text-butcher-700 disabled:opacity-20 transition-colors"
                  >
                    <Minus size={16} strokeWidth={3}/>
                  </button>
                  
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-sm font-black text-earth-900 leading-none">
                      {quantity}
                    </span>
                    <span className="text-[8px] font-bold text-earth-400 uppercase tracking-tighter">kg</span>
                  </div>

                  <button 
                    onClick={() => addToCart(item, 0.5, cutType)}
                    className="text-earth-400 hover:text-butcher-700 transition-colors"
                  >
                    <Plus size={16} strokeWidth={3}/>
                  </button>
                </div>

                {/* Subtotal and Delete */}
                <div className="flex items-center gap-6 min-w-[120px] justify-end">
                  <div className="text-right">
                    <p className="font-black text-earth-900 text-xl tracking-tighter">
                      ${itemTotal}
                    </p>
                    <p className="text-[9px] text-earth-400 font-bold uppercase tracking-widest">
                      Item Total
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(id)}
                    className="p-2 text-earth-200 hover:text-red-500 transition-colors bg-earth-50 md:bg-transparent rounded-full"
                    title="Remove from basket"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OrderReview;
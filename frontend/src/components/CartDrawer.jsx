import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  // Pulling everything from context
  const { cart, cartCount, addToCart, subtotal, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-earth-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        
        {/* Header Section */}
        <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-butcher-700" size={24} />
            <h2 className="text-xl font-black font-heading uppercase tracking-tighter">
              Your Cart ({cartCount})
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth-50 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-400 font-medium italic">Your basket is empty.</p>
              <button 
                onClick={() => { onClose(); navigate('/products'); }}
                className="mt-4 text-butcher-700 font-black uppercase tracking-widest text-xs underline decoration-2 underline-offset-4"
              >
                Browse Fresh Cuts
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const { id, name, image, price, quantity, cutType } = item;
              const displayPrice = (Number(price || 0) * quantity).toFixed(2);

              return (
                <div key={id} className="flex gap-4 items-center bg-earth-50 p-4 rounded-[2rem] border border-earth-100 relative group">
                  <img src={image} alt={name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start pr-2">
                      <h3 className="font-black text-sm text-earth-900 uppercase tracking-tight leading-none">
                        {name}
                      </h3>
                      {/* Optional: Add a small remove button using Trash2 */}
                      {removeFromCart && (
                        <button 
                          onClick={() => removeFromCart(id)} 
                          className="text-earth-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-butcher-700 font-bold uppercase tracking-widest mt-1">
                      {cutType ? cutType.replace('_', ' ') : 'Standard Cut'}
                    </p>

                    <div className="flex justify-between items-center mt-3">
                      <p className="font-black text-earth-900">${displayPrice}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-earth-100">
                        <button 
                          onClick={() => addToCart(item, -0.5, cutType)}
                          disabled={quantity <= 0.5}
                          className="text-earth-400 hover:text-butcher-700 disabled:opacity-20 transition-colors"
                        >
                          <Minus size={14} strokeWidth={3}/>
                        </button>
                        <span className="text-xs font-black min-w-[30px] text-center">{quantity}kg</span>
                        <button 
                          onClick={() => addToCart(item, 0.5, cutType)}
                          className="text-earth-400 hover:text-butcher-700 transition-colors"
                        >
                          <Plus size={14} strokeWidth={3}/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer / Checkout */}
        {cart.length > 0 && (
          <div className="p-8 bg-white border-t border-earth-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-earth-400 font-black uppercase tracking-widest text-[10px]">Estimated Total</span>
              <span className="text-3xl font-black text-butcher-700 font-heading">
                ${Number(subtotal || 0).toFixed(2)}
              </span>
            </div>
            <button 
              className="w-full py-5 bg-earth-900 text-white font-black rounded-2xl shadow-xl hover:bg-butcher-800 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
              onClick={() => alert("Proceeding to secure checkout at Bendemeer portal...")}
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
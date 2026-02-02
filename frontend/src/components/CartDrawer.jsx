import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, cartCount, addToCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-earth-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
        <div className="p-6 border-b border-earth-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-butcher-700" size={24} />
            <h2 className="text-xl font-black font-heading">Your Cart ({cartCount})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth-50 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-earth-400 font-medium">Your basket is empty.</p>
              <button 
                onClick={() => { onClose(); navigate('/products'); }}
                className="mt-4 text-butcher-700 font-bold underline"
              >
                Browse Fresh Cuts
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-earth-50 p-4 rounded-3xl border border-earth-100">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-2xl" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-earth-900">{item.name}</h3>
                  <p className="text-[10px] text-butcher-700 font-bold uppercase tracking-widest">
                    {item.cutType.replace('_', ' ')}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-black text-earth-900">${(item.basePrice * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-full shadow-sm">
                      <button onClick={() => addToCart(item, -0.5, item.cutType)}><Minus size={14}/></button>
                      <span className="text-xs font-bold">{item.quantity}kg</span>
                      <button onClick={() => addToCart(item, 0.5, item.cutType)}><Plus size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 glass-card border-t border-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-earth-400 font-bold uppercase tracking-widest text-xs">Subtotal</span>
              <span className="text-2xl font-black text-butcher-700">${total.toFixed(2)}</span>
            </div>
            <button 
              className="w-full py-5 bg-earth-900 text-white font-black rounded-2xl shadow-xl hover:bg-butcher-800 transition-all uppercase tracking-widest text-sm"
              onClick={() => {
                alert("Proceeding to secure checkout at Bendemeer portal...");
              }}
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
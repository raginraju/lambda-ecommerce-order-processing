import React from 'react';
import { CreditCard, ShieldCheck, ChevronRight } from 'lucide-react';

const OrderSummary = ({ subtotal, onPay, isAddressComplete }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white sticky top-24">
      <h3 className="text-xl font-black text-earth-900 uppercase tracking-tighter mb-8 pb-4 border-b border-earth-50">Order Summary</h3>
      
      <div className="space-y-5 mb-10">
        <div className="flex justify-between">
          <span className="text-earth-400 font-bold uppercase tracking-widest text-[10px]">Items Total</span>
          <span className="font-black text-earth-900">${Number(subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-earth-400 font-bold uppercase tracking-widest text-[10px]">Delivery Fee</span>
          <span className="font-black text-green-600 uppercase text-[10px] tracking-widest">Free</span>
        </div>
        <div className="pt-6 border-t border-earth-100 flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-earth-900 font-black uppercase text-xs tracking-tighter">Total Amount</span>
            <span className="text-[10px] text-earth-400 font-medium">Inclusive of GST</span>
          </div>
          <span className="text-4xl font-black text-butcher-700 font-heading">
            ${Number(subtotal).toFixed(2)}
          </span>
        </div>
      </div>

      <button 
        onClick={onPay}
        className="group w-full py-5 bg-earth-900 text-white font-black rounded-2xl shadow-xl hover:bg-butcher-800 transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3 mb-6"
      >
        <CreditCard size={18} /> 
        Proceed to Payment
        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <div className="flex flex-col items-center gap-4 py-4 px-6 bg-earth-50 rounded-2xl">
        <div className="flex items-center gap-2 text-earth-400">
          <ShieldCheck size={18} className="text-green-500" />
          <span className="text-[9px] font-black uppercase tracking-widest">Secure Checkout</span>
        </div>
        <p className="text-[9px] text-earth-400 text-center leading-relaxed font-medium">
          Secure handoff to the portal.
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
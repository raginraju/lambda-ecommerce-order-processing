import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '@/api/orders';
import { Navbar } from '@/components/ui';
import { Package, Loader2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = await fetchUserOrders();
        // Sort by date (newest first) if your API doesn't do it
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted);
      } catch (error) {
        console.error("Order fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-earth-900 leading-none">
            Order History
          </h1>
          <p className="text-earth-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Your Premium Poultry Archive
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-butcher-700" size={40} />
            <p className="text-earth-400 font-bold uppercase text-[10px] tracking-widest">Accessing Ledger...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-xl border border-white">
            <div className="bg-earth-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-earth-200" size={32} />
            </div>
            <h2 className="text-xl font-black text-earth-900 uppercase mb-2">No Orders Yet</h2>
            <p className="text-earth-400 text-sm mb-8">Ready to fill your butcher's box?</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-earth-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-butcher-700 transition-colors shadow-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.orderId} className="group bg-white p-6 rounded-[2rem] shadow-sm border border-white hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-earth-900 text-white p-4 rounded-2xl shadow-inner">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-butcher-700 uppercase">Confirmed</span>
                        <span className="text-[10px] text-earth-300">•</span>
                        <span className="text-[10px] font-bold text-earth-400 uppercase">
                          {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-black text-earth-900 uppercase tracking-tight">#{order.orderId.slice(-8)}</h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-earth-50">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-earth-300 uppercase leading-none">Total Weight</p>
                      <p className="font-bold text-earth-900">{order.items.reduce((acc, item) => acc + item.quantity, 0)} kg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-earth-300 uppercase leading-none">Paid</p>
                      <p className="text-2xl font-black text-butcher-700">${Number(order.total).toFixed(2)}</p>
                    </div>
                    <ChevronRight size={20} className="text-earth-200 group-hover:text-butcher-700 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
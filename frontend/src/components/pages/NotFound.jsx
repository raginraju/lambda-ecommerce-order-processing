import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-earth-50">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-earth-200 uppercase tracking-tighter">404</h1>
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-earth-900 font-black text-2xl uppercase whitespace-nowrap">
            Lost in the pantry?
          </p>
        </div>
        
        <p className="text-earth-500 font-medium italic">
          The cut you're looking for isn't on the block today. 
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/home')}
            className="w-full py-4 bg-earth-900 text-white font-black rounded-2xl hover:bg-butcher-800 transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <Home size={18} /> Back to Storefront
          </button>
          
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-4 bg-white text-earth-900 font-black rounded-2xl border border-earth-100 hover:bg-earth-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={18} /> Previous Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
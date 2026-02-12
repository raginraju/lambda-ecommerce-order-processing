import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, DollarSign, ArrowLeft, Loader2, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getToken, user } = useAuth();

  // State - Always initialize as an empty array to prevent .map() crashes
  const [products, setProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  // 1. Initial Fetch with Defensive Logic
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetching from CloudFront path
        const response = await axios.get('/data/products.json');
        
        // Ensure data is an array (handles direct arrays or wrapped { products: [] } objects)
        const data = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.products || []);
          
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]); // Fallback to empty list on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. Local State Update
  const handlePriceChange = (id, newPrice) => {
    // Check if products is an array before mapping
    if (!Array.isArray(products)) return;
    
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, price: parseFloat(newPrice) || 0 } : p
    ));
  };

  // 3. API Sync (Triggered from Modal)
  const handleUpdate = async () => {
    setShowConfirm(false); 
    setIsSaving(true);

    try {
      const token = getToken();
      if (!token) {
        alert("Session expired. Please log in again.");
        navigate('/login');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/update-pricing`, 
        { products: products },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      alert(`Success! Prices published by ${user?.email || 'Admin'}`);
      
    } catch (error) {
      console.error("Publishing Error:", error);
      const status = error.response?.status;
      if (status === 403) alert("Access Denied: Admin permissions required.");
      else alert("Failed to update prices. Check AWS logs.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50">
      <Loader2 className="animate-spin text-butcher-700" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-earth-50 p-6 md:p-12 relative">
      
      {/* --- MODAL OVERLAY --- */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-earth-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-butcher-50 rounded-2xl text-butcher-600">
                <AlertTriangle size={32} />
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-earth-300 hover:text-earth-900">
                <X size={24} />
              </button>
            </div>
            
            <h3 className="text-2xl font-black text-earth-900 uppercase tracking-tighter mb-2">
              Confirm Publication?
            </h3>
            <p className="text-earth-500 text-sm font-medium mb-8 leading-relaxed">
              This will update the <span className="font-bold text-earth-900">Master Database</span> and clear the global CloudFront cache.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-4 rounded-xl font-bold uppercase text-xs tracking-widest text-earth-400 hover:bg-earth-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdate}
                className="flex-1 bg-earth-900 text-white px-6 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-butcher-700 transition-all shadow-lg"
              >
                Confirm & Push
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DASHBOARD HEADER --- */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <button 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-earth-400 font-bold text-xs uppercase tracking-widest hover:text-earth-900 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Shop
          </button>
          <h1 className="text-4xl font-black text-earth-900 font-heading tracking-tighter uppercase">
            Price Control <span className="text-butcher-600">Center</span>
          </h1>
        </div>
        
        <button 
          onClick={() => setShowConfirm(true)}
          disabled={isSaving}
          className="bg-earth-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-butcher-700 transition-all shadow-xl disabled:opacity-50 active:scale-95"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Publish to Edge
        </button>
      </div>

      {/* Product List with Guard */}
      <div className="max-w-4xl mx-auto space-y-4">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="glass-card bg-white/70 border-white p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-earth-100 rounded-2xl flex items-center justify-center overflow-hidden border border-earth-200">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-earth-900 uppercase tracking-tight text-lg">{product.name}</p>
                    <p className="text-[10px] text-earth-400 font-bold uppercase mb-2">{product.id} • {product.unit}</p>
                    
                    {product.cuts && product.cuts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.cuts.map(cut => (
                          <span key={cut} className="text-[9px] px-2 py-0.5 bg-butcher-50 text-butcher-700 rounded-md font-bold uppercase">
                            {cut}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-earth-50 shadow-inner">
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={16} />
                    <input 
                      type="number" 
                      step="0.01"
                      value={product.price}
                      onChange={(e) => handlePriceChange(product.id, e.target.value)}
                      className="pl-10 pr-4 py-3 w-32 bg-transparent font-black text-earth-900 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="p-2 bg-earth-50 rounded-lg text-earth-400">
                    <RefreshCw size={16} />
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-20 bg-white/50 rounded-[2.5rem] border-2 border-dashed border-earth-200">
            <p className="text-earth-400 font-bold uppercase tracking-widest text-xs">No products found or file is empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
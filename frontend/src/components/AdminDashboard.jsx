import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, AlertTriangle, X, DollarSign, Plus } from 'lucide-react'; // Added Plus
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { getToken, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // New state to track the text being typed for a new cut per product
  const [newCutInputs, setNewCutInputs] = useState({});

  const cdnUrl = import.meta.env.VITE_CDN_URL || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${cdnUrl}/data/products.json`);
        const data = Array.isArray(response.data) ? response.data : (response.data?.products || []);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [cdnUrl]);

  // --- Logic to Add/Remove Specific Cuts ---

  const addCutToProduct = (productId) => {
    const cutText = newCutInputs[productId]?.trim().toUpperCase();
    if (!cutText) return;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        // Prevent duplicate cuts in the list
        const currentCuts = p.cuts || [];
        if (currentCuts.includes(cutText)) return p;
        return { ...p, cuts: [...currentCuts, cutText] };
      }
      return p;
    }));

    // Clear input for this specific product
    setNewCutInputs(prev => ({ ...prev, [productId]: '' }));
  };

  const removeCutFromProduct = (productId, cutToRemove) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, cuts: p.cuts.filter(c => c !== cutToRemove) } 
        : p
    ));
  };

  const handlePriceChange = (id, newPrice) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, price: Number(newPrice) || 0 } : p
    ));
  };

  const handleUpdate = async () => {
    setShowConfirm(false); 
    setIsSaving(true);
    
    try {
      const token = getToken();
      
      if (!token) {
        alert("Session expired. Please log in again.");
        // Use the context's logout to clear state before redirecting
        if (typeof logout === 'function') logout(); 
        navigate('/login');
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/update-pricing`, 
        { products: products },
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } }
      );
      
      alert("Success! Changes published to the edge.");
      
    } catch (error) {
      console.error("Publishing Error:", error);

      // Status 401 = Unauthorized (Token expired)
      // Status 403 = Forbidden (Invalid permissions)
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      
      // Axios "Network Error" often happens when CORS blocks a 401 response
      const isNetworkError = error.message === "Network Error";

      if (isAuthError || isNetworkError) {
        alert("Security session expired. Redirecting to login...");
        
        // --- INTEGRATION POINT ---
        // We call your existing logout() to clear localStorage/state
        if (typeof logout === 'function') {
          logout(); 
        }
        
        navigate('/login');
      } else {
        alert(`Update failed: ${error.response?.data?.message || "Check AWS Gateway logs."}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-earth-50"><Loader2 className="animate-spin text-butcher-700" size={48} /></div>;

  return (
    <div className="min-h-screen bg-earth-50 p-6 md:p-12 relative">
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-earth-100">
            <div className="flex justify-between mb-6">
              <AlertTriangle className="text-butcher-600" size={32} />
              <button onClick={() => setShowConfirm(false)}><X size={24} /></button>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 text-earth-900">Confirm Updates?</h3>
            <p className="text-earth-500 text-sm mb-8 leading-relaxed">This will update the Master S3 JSON and invalidate the CloudFront cache globally.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 font-bold text-xs uppercase tracking-widest text-earth-400">Cancel</button>
              <button onClick={handleUpdate} className="flex-1 bg-earth-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-earth-400 font-bold text-xs uppercase tracking-widest mb-2">
            <ArrowLeft size={14} /> Back to Shop
          </button>
          <h1 className="text-4xl font-black text-earth-900 uppercase tracking-tighter font-heading">
            Butcher <span className="text-butcher-600">Console</span>
          </h1>
        </div>
        
        <button onClick={() => setShowConfirm(true)} disabled={isSaving} className="bg-earth-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl">
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
          Push Changes
        </button>
      </div>

      {/* Product List */}
      <div className="max-w-4xl mx-auto space-y-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white/70 backdrop-blur-md border border-white/50 p-6 rounded-[2.5rem] shadow-sm">
            <div className="flex flex-col md:flex-row gap-8">
              
              {/* Product Identity */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-earth-100 rounded-3xl overflow-hidden border border-earth-200 shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-black text-earth-900 uppercase tracking-tight text-xl">{product.name}</h3>
                  <p className="text-[10px] text-earth-400 font-bold uppercase mt-1">{product.id} • {product.unit}</p>
                </div>
              </div>

              {/* Controls Section */}
              <div className="flex-1 space-y-5">
                {/* Price Control */}
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={16} />
                  <input 
                    type="number" 
                    step="0.01" 
                    value={product.price} 
                    onChange={(e) => handlePriceChange(product.id, e.target.value)} 
                    className="pl-10 pr-4 py-3 w-full bg-white rounded-2xl border border-earth-100 font-black text-earth-900 focus:outline-none" 
                  />
                </div>

                {/* Cuts Control - ADD BUTTON BESIDE INPUT */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type new cut (e.g. CURRY CUT)"
                      value={newCutInputs[product.id] || ''}
                      onChange={(e) => setNewCutInputs(prev => ({ ...prev, [product.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addCutToProduct(product.id)}
                      className="flex-1 px-4 py-3 bg-white border border-earth-100 rounded-xl text-[10px] font-bold uppercase text-earth-900 focus:outline-none"
                    />
                    <button 
                      onClick={() => addCutToProduct(product.id)}
                      className="bg-butcher-700 text-white p-3 rounded-xl hover:bg-butcher-800 transition-colors shadow-md active:scale-95"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>

                  {/* List of active cuts with delete option */}
                  <div className="flex flex-wrap gap-2">
                    {product.cuts?.map(cut => (
                      <div key={cut} className="flex items-center gap-1.5 px-3 py-1.5 bg-butcher-50 text-butcher-700 rounded-lg border border-butcher-100 group">
                        <span className="text-[9px] font-black uppercase tracking-wider">{cut}</span>
                        <button 
                          onClick={() => removeCutFromProduct(product.id, cut)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
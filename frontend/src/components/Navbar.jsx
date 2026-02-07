import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, User, LogOut, Settings, ChevronDown, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import your new hook

const Navbar = ({ onOpenCart }) => {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth(); // Use context instead of local state
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" 
        onClick={() => navigate('/home')}
      >
        <div className="w-8 h-8 bg-butcher-700 rounded-lg rotate-3 flex items-center justify-center shadow-md">
          <span className="text-white font-black">B</span>
        </div>
        <span className="text-xl font-black font-heading tracking-tighter text-earth-900 uppercase">
          The Block
        </span>
      </div>
      
      {/* Actions Section */}
      <div className="flex gap-3 items-center">
        <Search size={20} className="text-earth-400 cursor-not-allowed hidden sm:block" />
        
        {/* Cart Icon */}
        <div 
          className="relative cursor-pointer hover:scale-110 transition-transform p-2" 
          onClick={onOpenCart}
        >
          <ShoppingCart size={22} className="text-earth-900" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-butcher-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white animate-pulse">
              {cartCount}
            </span>
          )}
        </div>

        {/* AUTH CONDITIONAL RENDERING - Driven by AuthContext */}
        {isAuthenticated ? (
          /* SHOW: Profile Dropdown when Logged In */
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1 p-1 rounded-2xl bg-earth-100 hover:bg-earth-200 transition-colors border border-earth-200"
            >
              <div className="w-8 h-8 bg-earth-900 rounded-xl flex items-center justify-center text-white">
                <User size={18} />
              </div>
              <ChevronDown size={14} className={`text-earth-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-earth-100 py-2 z-[60] animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="px-4 py-2 border-b border-earth-50 mb-1">
                  <p className="text-[10px] font-bold text-earth-400 uppercase tracking-widest">Customer</p>
                  {/* Displays real name from Cookie/Context */}
                  <p className="text-sm font-black text-earth-900 truncate">{user?.name || 'Avin M. Raju'}</p>
                </div>

                <button 
                  onClick={() => { navigate('/account'); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-earth-600 hover:bg-earth-50 hover:text-butcher-700 transition-colors"
                >
                  <Settings size={16} /> Account Settings
                </button>

                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          /* SHOW: Login Button when Logged Out */
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-5 py-2.5 bg-earth-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-butcher-700 transition-all active:scale-95 shadow-md"
          >
            <LogIn size={16} /> Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
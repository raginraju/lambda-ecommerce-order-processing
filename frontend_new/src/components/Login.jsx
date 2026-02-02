import React from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* The Glass Card Container */}
      <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] shadow-2xl border-white animate-fade-in">
        
        {/* Logo & Heading */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-butcher-700 rounded-2xl rotate-3 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-butcher-200">
            <span className="text-white font-black text-2xl font-heading">B</span>
          </div>
          <h2 className="text-4xl font-black text-earth-900 font-heading">Welcome Back</h2>
          <p className="text-earth-500 mt-2 font-medium">Premium cuts are just a click away.</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <label className="block text-xs font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={20} />
              <input 
                type="email" 
                placeholder="avin@example.com" 
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all font-body"
              />
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-xs font-black text-earth-400 uppercase tracking-widest">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all font-body"
              />
            </div>
          </div>

          <button className="w-full py-5 bg-butcher-700 text-white font-black rounded-2xl hover:bg-butcher-800 transition-all shadow-xl shadow-butcher-100 flex items-center justify-center gap-2 group">
            SIGN IN <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-earth-500 text-sm font-medium">
          New to the block? 
          <Link to="/signup" className="text-butcher-700 font-black hover:underline ml-1 uppercase tracking-tighter">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
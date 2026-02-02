import React from 'react';
import { User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-earth-50">
      <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] shadow-2xl border-white animate-fade-in">
        
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-earth-900 font-heading">Join the Block</h2>
          <p className="text-earth-500 mt-2 font-medium italic">Artisanal poultry, ethically sourced.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Name Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={16} />
                <input type="text" placeholder="Avin" className="w-full pl-10 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
              <input type="text" placeholder="Raju" className="w-full px-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all text-sm" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={18} />
              <input type="email" placeholder="name@example.com" className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={18} />
              <input type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all" />
            </div>
          </div>

          {/* Policy Box */}
          <div className="flex items-start gap-3 p-4 bg-earth-100/50 rounded-2xl border border-earth-100">
            <ShieldCheck className="text-butcher-600 shrink-0" size={20} />
            <p className="text-[10px] leading-tight text-earth-500 font-medium">
              By joining, you agree to receive updates on our fresh broiler chicken stock and accept our organic sourcing standards.
            </p>
          </div>

          <button className="w-full py-5 bg-butcher-700 text-white font-black rounded-2xl hover:bg-butcher-800 transition-all shadow-xl shadow-butcher-100 flex items-center justify-center gap-2 group tracking-widest uppercase text-sm">
            Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-8 text-center text-earth-500 text-sm font-medium">
          Already a member? 
          <Link to="/login" className="text-butcher-700 font-black hover:underline ml-1 uppercase tracking-tighter">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
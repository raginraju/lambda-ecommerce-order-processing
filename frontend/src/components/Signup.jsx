import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import cognitoClient from '../api/axiosClient'; // Use your centralized client

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // We use the cognitoClient and pass only the specific Target header
      await cognitoClient.post('/', 
        {
          ClientId: ClientId, 
          Username: email,
          Password: password,
          UserAttributes: [
            { Name: "email", Value: email }
          ]
        },
        {
          headers: {
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.SignUp'
          }
        }
      );

      alert("Signup successful! Please check your email for the verification code.");
      navigate('/login');
      
    } catch (error) {
      // Axios error handling captures AWS specific error messages
      const message = error.response?.data?.message || "An error occurred during signup.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-earth-50">
      <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] shadow-2xl border-white animate-fade-in">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-earth-900 font-heading uppercase tracking-tighter">Join the Block</h2>
          <p className="text-earth-500 mt-2 font-medium italic">Artisanal poultry, ethically sourced.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSignup}>
          
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com" 
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all" 
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-earth-100/50 rounded-2xl border border-earth-100">
            <ShieldCheck className="text-butcher-600 shrink-0" size={20} />
            <p className="text-[10px] leading-tight text-earth-500 font-medium">
              By joining, you agree to receive updates on our fresh broiler chicken stock in Bendemeer.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-butcher-700 text-white font-black rounded-2xl hover:bg-butcher-800 transition-all shadow-xl shadow-butcher-100 flex items-center justify-center gap-2 group tracking-widest uppercase text-sm disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Account'} 
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
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
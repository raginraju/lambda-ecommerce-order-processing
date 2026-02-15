import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authClient } from '@/api';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const { login } = useAuth(); // Destructure the login function from context
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const ClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authClient.post('/', 
        {
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: ClientId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password
          }
        },
        {
          headers: {
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth'
          }
        }
      );

      // 1. Extract tokens from the AWS response
      const { IdToken, AccessToken, RefreshToken } = response.data.AuthenticationResult;
      
      // 2. Prepare user data object
      // We use the email prefix as a temporary name until we decode the JWT token
      const userData = {
        email: email,
        name: email.split('@')[0], 
        id: email
      };

      const tokens = {
        idToken: IdToken,
        accessToken: AccessToken,
        refreshToken: RefreshToken
      };

      // 3. Trigger Global State Update
      // This is the "magic" line that updates the Navbar and Cookies
      login(userData, tokens);

      // 4. Smart Redirect Logic
      // We manually peek at the token just for the redirect decision
      const decoded = JSON.parse(atob(IdToken.split('.')[1]));
      const isAdmin = decoded['cognito:groups']?.includes('Admins');

      // 4. Redirect Logic
      // If the user was trying to go to /checkout, send them back there.
      // Priority: 1. Where they were trying to go, 2. Admin Dashboard (if admin), 3. Home
      const defaultPath = isAdmin ? '/admin' : '/home';
      const from = location.state?.from?.pathname || defaultPath;
      navigate(from, { replace: true });
      
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-earth-50">
      <div className="max-w-md w-full glass-card p-10 rounded-[2.5rem] shadow-2xl border-white animate-in fade-in zoom-in duration-300">
        
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 bg-butcher-700 rounded-2xl rotate-3 flex items-center justify-center shadow-lg mb-4 mx-auto">
            <span className="text-white font-black text-xl">B</span>
          </div>
          <h2 className="text-4xl font-black text-earth-900 font-heading uppercase tracking-tighter">The Block</h2>
          <p className="text-earth-500 mt-2 font-medium italic">Sign in to your artisanal pantry.</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email Input */}
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
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all placeholder:text-earth-200 text-earth-900 font-medium" 
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[10px] font-black text-earth-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-earth-100 rounded-2xl focus:ring-2 focus:ring-butcher-500 outline-none transition-all placeholder:text-earth-200 text-earth-900 font-medium" 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-earth-900 text-white font-black rounded-2xl hover:bg-butcher-800 transition-all shadow-xl flex items-center justify-center gap-2 group tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {loading ? 'Authenticating...' : 'Sign In'} 
            {!loading && <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="mt-8 text-center text-earth-500 text-sm font-medium">
          New here? 
          <Link to="/signup" className="text-butcher-700 font-black hover:underline ml-1 uppercase tracking-tighter transition-colors">
            Join the Block
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Initialize Auth State on Load
  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = Cookies.get('user_data');
      const token = Cookies.get('idToken');

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user data", error);
          logout(); // Clean up corrupted data
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // 2. Login Function
  const login = (userData, tokens) => {
    // Security Config: Secure (HTTPS only), SameSite (Anti-CSRF)
    const cookieConfig = { 
      expires: 7, // 7 days
      secure: true, 
      sameSite: 'strict' 
    };

    // Store Tokens and User Data in Cookies
    Cookies.set('idToken', tokens.idToken, cookieConfig);
    Cookies.set('accessToken', tokens.accessToken, cookieConfig);
    
    // Store basic user info for the UI
    const simplifiedUser = {
      name: userData.name || 'Valued Customer',
      email: userData.email,
      id: userData.sub
    };
    
    Cookies.set('user_data', JSON.stringify(simplifiedUser), cookieConfig);
    setUser(simplifiedUser);
  };

  // 3. Logout Function
  const logout = () => {
    Cookies.remove('idToken');
    Cookies.remove('accessToken');
    Cookies.remove('user_data');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
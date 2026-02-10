import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = Cookies.get('user_data');
      const token = Cookies.get('idToken');

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user data", error);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = (userData, tokens) => {
    const cookieConfig = { 
      expires: 7, 
      secure: true, 
      sameSite: 'strict' 
    };

    // 1. Decode the ID Token to check for Admin group
    // The ID Token is the one that contains Cognito Groups
    let isAdmin = false;
    try {
      const decoded = jwtDecode(tokens.idToken);
      const groups = decoded['cognito:groups'] || [];
      isAdmin = groups.includes('Admins');
    } catch (e) {
      console.error("Error decoding token for admin check", e);
    }

    // 2. Add isAdmin to the simplified user object
    const simplifiedUser = {
      name: userData.name || userData.email?.split('@')[0] || 'Valued Customer',
      email: userData.email,
      id: userData.sub,
      isAdmin: isAdmin // This drives the Navbar logic
    };

    Cookies.set('idToken', tokens.idToken, cookieConfig);
    Cookies.set('accessToken', tokens.accessToken, cookieConfig);
    Cookies.set('user_data', JSON.stringify(simplifiedUser), cookieConfig);
    
    setUser(simplifiedUser);
  };

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
    loading,
    getToken: () => Cookies.get('idToken')
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
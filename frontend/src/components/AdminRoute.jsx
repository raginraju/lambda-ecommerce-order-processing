import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // 1. Wait for AuthContext to finish reading cookies
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50">
      <Loader2 className="animate-spin text-butcher-700" size={48} />
    </div>
  );

  // 2. Check if they are even logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. The specific Email Check (Use YOUR email here)
  const ADMIN_EMAIL = 'avinmraju@example.com'; 
  
  if (user?.email !== ADMIN_EMAIL) {
    console.warn("Unauthorized admin access attempt by:", user?.email);
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
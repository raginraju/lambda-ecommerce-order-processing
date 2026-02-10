import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-earth-50"><Loader2 className="animate-spin text-butcher-700" size={48} /></div>;
  
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (!user?.isAdmin) {
    console.warn("Unauthorized admin access by:", user?.email);
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
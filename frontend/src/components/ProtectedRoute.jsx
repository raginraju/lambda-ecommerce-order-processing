import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the hook

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Get state from Context
  const location = useLocation();

  // 1. Handle the "Refresh" state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        {/* Simple but stylish butcher-themed loader */}
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-butcher-700"></div>
          <p className="text-earth-400 font-bold text-xs uppercase tracking-widest">Checking the block...</p>
        </div>
      </div>
    );
  }

  // 2. Handle Unauthorized access
  if (!isAuthenticated) {
    // Redirect to /login and save the intended location (e.g., /checkout)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Render the protected content (e.g., Checkout)
  return children;
};

export default ProtectedRoute;
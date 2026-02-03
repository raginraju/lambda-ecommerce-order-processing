import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  // Check your auth state (localStorage, Context, or Cognito)
  const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

  if (!isAuthenticated) {
    // Redirect to /login and save the 'checkout' location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// 1. Context Providers (Update to use @ alias)
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';

// 2. Auth & Security Logic
import { ProtectedRoute, AdminRoute } from '@/components/auth';

// 3. Page Components
import { Home, Login, Signup, Products, Orders, NotFound } from '@/components/pages';

// 4. Feature-Specific Components
import { AdminDashboard } from '@/components/admin';
import { Checkout } from '@/components/checkout';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <Toaster position="bottom-right" reverseOrder={false} />
        <Router>
          <div className="min-h-screen bg-earth-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/products" element={<Products />} />

              {/* Protected Route: Orders (History) */}
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Route: Checkout */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout /> 
                  </ProtectedRoute>
                } 
              />

              {/* Protected Route: Admin Dashboard */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Products from './components/Products'; 
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; // 1. Import AuthProvider
import NotFound from './components/NotFound';

function App() {
  return (
    <AuthProvider> {/* 2. Wrap Auth first */}
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-earth-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/products" element={<Products />} />

              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <div>Proceed to Payment</div> 
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
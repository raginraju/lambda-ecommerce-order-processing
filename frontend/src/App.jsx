import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Products from './components/Products'; 
import ProtectedRoute from './components/ProtectedRoute'; // The wrapper we discussed
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-earth-50">
          <Routes>
            {/* 1. Everyone lands here first */}
            <Route path="/" element={<Home />} />
            
            {/* 2. Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* 3. Other public pages */}
            <Route path="/products" element={<Products />} />

            {/* 4. Gated Page: Redirects to /login if not authenticated */}
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  {/* Your Checkout Component */}
                  <div>Proceed to Payment</div> 
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
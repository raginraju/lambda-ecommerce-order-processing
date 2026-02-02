import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Products from './components/Products'; // New Import
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-earth-50">
        <CartProvider>
            <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} /> {/* New Route */}
            </Routes>
        </CartProvider>
      </div>
    </Router>
  );
}

export default App;
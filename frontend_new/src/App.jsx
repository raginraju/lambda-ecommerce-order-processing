import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Products from './components/Products'; 
import { CartProvider } from './context/CartContext';

function App() {
  return (
    /* Wrapping everything in the Provider is the "Professional Way" */
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-earth-50">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
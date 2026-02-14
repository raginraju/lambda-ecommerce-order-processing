import React, { useState } from 'react';
import { useCart } from "@/context/CartContext";
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/ui';
import { AddressSection, OrderReview, OrderSummary } from "./";

const Checkout = () => {
  const { cart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [address, setAddress] = useState({ street: "", unit: "", postalCode: "", contact: "" });

  if (!user) return <Navigate to="/login" />;
  if (cart.length === 0) return <Navigate to="/products" />;

  const isAddressComplete = address.street && address.postalCode && address.contact;

  const handleFinalPayment = () => {
    if (!isAddressComplete) {
      alert("Please complete your delivery address.");
      setIsEditingAddress(true);
      return;
    }
    alert("Handoff to Secure Bendemeer portal...");
  };

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-12">
        <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-earth-400 font-bold text-xs uppercase tracking-widest hover:text-butcher-700 mb-8 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Butcher Shop
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <AddressSection 
              user={user} 
              address={address} 
              setAddress={setAddress} 
              isEditing={isEditingAddress} 
              setIsEditing={setIsEditingAddress} 
            />
            <OrderReview cart={cart} />
          </div>

          <div className="lg:col-span-1">
            <OrderSummary 
              subtotal={subtotal} 
              onPay={handleFinalPayment} 
              isAddressComplete={isAddressComplete} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
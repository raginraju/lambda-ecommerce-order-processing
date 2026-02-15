import React, { useState } from 'react';
import { useCart } from "@/context/CartContext";
import { useAuth } from '@/context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/ui';
import { AddressSection, OrderReview, OrderSummary } from "./";
import { apiClient } from '@/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditingAddress, setIsEditingAddress] = useState(true);
  const [address, setAddress] = useState({ 
    street: "", 
    unit: "", 
    postalCode: "", 
    contact: "" 
  });

  if (!user) return <Navigate to="/login" />;
  if (cart.length === 0) return <Navigate to="/products" />;

  const isAddressComplete = address.street && address.postalCode && address.contact;

  const handleFinalPayment = async () => {
    if (!isAddressComplete) {
      toast.error("Please complete your delivery address.");
      setIsEditingAddress(true);
      return;
    }

    const loadingToast = toast.loading("Processing your bulk order...");

    try {
      // OPTIMAL DATA STRUCTURE: One request, many items
      const orderData = {
        order_metadata: {
          user_id: user.id,
          user_email: user.email,
          timestamp: new Date().toISOString()
        },
        items: cart.map(item => ({
          cut_type: item.cutType || "WHOLE_CHICKEN",
          weight: item.quantity, 
          price_per_kg: item.price,
          quantity: 1 // Representing 1 unit of the specified weight
        })),
        delivery_details: {
          location: `${address.street}, ${address.unit}`,
          postal_code: address.postalCode,
          delivery_instructions: "Leave at front door.",
          contact: address.contact
        },
        totals: {
          subtotal: subtotal,
          delivery_charge: 5.00,
          total: subtotal + 5.00
        }
      };

      const response = await apiClient.post('/orders', orderData);

      if (response.status === 200 || response.status === 201) {
        clearCart();
        toast.dismiss(loadingToast);
        toast.success("Order placed successfully!", { duration: 4000 });
        
        // Success: Redirect home
        setTimeout(() => navigate('/home'), 2000);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Order API Error:", error);
      toast.error(error.response?.data?.message || "Order failed. Check API connectivity.");
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 pb-20">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-12">
        <button 
          onClick={() => navigate('/products')} 
          className="flex items-center gap-2 text-earth-400 font-bold text-xs uppercase tracking-widest hover:text-butcher-700 mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Butcher Shop
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
            <OrderReview /> 
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
import React from 'react';
import { MapPin, Truck, Building, Phone } from 'lucide-react';

const AddressSection = ({ user, address, setAddress, isEditing, setIsEditing }) => {
  return (
    <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-earth-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-earth-900 uppercase tracking-tighter flex items-center gap-3">
          <Truck className="text-butcher-700" /> Delivery Details
        </h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-black uppercase tracking-widest text-butcher-700 underline underline-offset-4"
          >
            Edit Address
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-400 ml-2 tracking-widest">Street Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-200" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 123 Bendemeer Road"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-earth-50 border border-earth-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-butcher-700/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-400 ml-2 tracking-widest">Unit Number</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-200" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. #04-01"
                  value={address.unit}
                  onChange={(e) => setAddress({...address, unit: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-earth-50 border border-earth-100 rounded-2xl text-sm font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-400 ml-2 tracking-widest">Postal Code</label>
              <input 
                type="text" 
                placeholder="e.g. 339942"
                value={address.postalCode}
                onChange={(e) => setAddress({...address, postalCode: e.target.value})}
                className="w-full px-5 py-4 bg-earth-50 border border-earth-100 rounded-2xl text-sm font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-earth-400 ml-2 tracking-widest">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-200" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 8123 4567"
                  value={address.contact}
                  onChange={(e) => setAddress({...address, contact: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-earth-50 border border-earth-100 rounded-2xl text-sm font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditing(false)}
            className="px-10 py-4 bg-earth-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-earth-800 transition-all shadow-lg active:scale-95"
          >
            Confirm Address
          </button>
        </div>
      ) : (
        <div className="p-6 bg-earth-50 rounded-[2rem] border border-earth-100 flex items-start gap-5">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-butcher-700">
            <MapPin size={24} />
          </div>
          <div className="flex-1">
            <p className="font-black text-earth-900 uppercase text-sm tracking-tight">{user.name || 'Resident'}</p>
            <p className="text-earth-500 text-sm mt-1 leading-relaxed">
              {address.street} {address.unit && `, ${address.unit}`}<br />
              Singapore {address.postalCode}
            </p>
            <div className="flex items-center gap-2 mt-3 text-butcher-700 font-bold text-[10px] uppercase tracking-widest">
              <Phone size={12} /> {address.contact}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AddressSection;
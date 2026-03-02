"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterShopPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    latitude: '',
    longitude: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
      }, (error) => {
        alert("Unable to retrieve your location. Please enter manually.");
      });
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Mock backend API call: POST /api/admin/shops
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-center">Registration Submitted!</h1>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Thank you for registering your shop on Local Links. Our admin team will verify your details. Once approved, you will be able to access the Shop Dashboard.
        </p>
        <Link href="/commerce" className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm text-center">
          Return to Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/commerce" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Commerce Hub
      </Link>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="bg-primary/5 p-8 border-b text-center">
           <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Store className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight mb-2">Register Your Shop</h1>
           <p className="text-muted-foreground">Join the Local Links network and start selling to your neighborhood.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-1.5">Shop Name *</label>
               <input 
                 required
                 type="text" 
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 placeholder="e.g. Fresh Veggies Mart" 
                 className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
               />
             </div>

             <div>
               <label className="block text-sm font-medium mb-1.5">Description</label>
               <textarea 
                 name="description"
                 value={formData.description}
                 onChange={handleChange}
                 placeholder="Tell customers what you sell..." 
                 rows="3"
                 className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
               ></textarea>
             </div>

             <div>
               <label className="block text-sm font-medium mb-1.5">Full Physical Address *</label>
               <textarea 
                 required
                 name="address"
                 value={formData.address}
                 onChange={handleChange}
                 placeholder="Shop #, Street, Locality..." 
                 rows="2"
                 className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
               ></textarea>
             </div>

             <div className="pt-2">
               <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">Location Coordinates *</label>
                  <button 
                    type="button" 
                    onClick={handleGetLocation}
                    className="text-xs text-primary font-medium hover:underline flex items-center"
                  >
                    <MapPin className="w-3.5 h-3.5 mr-1" /> Auto-Detect
                  </button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <input 
                   required
                   type="text" 
                   name="latitude"
                   value={formData.latitude}
                   onChange={handleChange}
                   placeholder="Latitude" 
                   className="w-full p-3 rounded-lg border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                 />
                 <input 
                   required
                   type="text" 
                   name="longitude"
                   value={formData.longitude}
                   onChange={handleChange}
                   placeholder="Longitude" 
                   className="w-full p-3 rounded-lg border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                 />
               </div>
               <p className="text-xs text-muted-foreground mt-2">These are used to show your shop to nearby residents.</p>
             </div>
           </div>

           <div className="pt-6 border-t mt-8">
             <button 
               type="submit" 
               disabled={isSubmitting}
               className={`w-full flex items-center justify-center py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
             >
               {isSubmitting ? (
                 <span className="flex items-center">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Submitting Registration...
                 </span>
               ) : 'Submit Shop Registration'}
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  CreditCard, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Car
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  
  const [deliveryType, setDeliveryType] = useState('shop_staff');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if cart is empty and not on success screen
  if (!cart && !isSuccess) {
    if (typeof window !== 'undefined') router.push('/commerce');
    return null;
  }

  const subtotal = cart?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0;
  const deliveryFee = deliveryType === 'pickup' ? 0 : 20;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/v1/commerce/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsSuccess(true);
        clearCart();
      } else {
        const data = await response.json();
        alert(data.message || "Checkout failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Cannot connect to backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-center">Order Placed Successfully!</h1>
        <p className="text-muted-foreground text-center max-w-md mb-8">
          Your order has been sent to the shopkeeper. You can track the status in your order history.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/commerce" className="px-6 py-3 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 transition-all shadow-sm text-center">
              Return to Hub
            </Link>
            <Link href="/commerce/orders/history" className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm text-center">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/commerce/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Delivery Options */}
          <section className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-primary" /> Delivery Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setDeliveryType('pickup')}
                className={`p-4 rounded-xl border text-left transition-all ${deliveryType === 'pickup' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50 bg-background'}`}
              >
                <Building2 className={`w-6 h-6 mb-3 ${deliveryType === 'pickup' ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className="font-semibold mb-1">Store Pickup</h3>
                <p className="text-xs text-muted-foreground">Pick up yourself. No fee.</p>
              </button>
              
              <button 
                onClick={() => setDeliveryType('shop_staff')}
                className={`p-4 rounded-xl border text-left transition-all ${deliveryType === 'shop_staff' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50 bg-background'}`}
              >
                <Clock className={`w-6 h-6 mb-3 ${deliveryType === 'shop_staff' ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className="font-semibold mb-1">Shop Staff</h3>
                <p className="text-xs text-muted-foreground">Delivered by the shop. ₹20</p>
              </button>
              
              <button 
                onClick={() => setDeliveryType('local_partner')}
                className={`p-4 rounded-xl border text-left transition-all ${deliveryType === 'local_partner' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50 bg-background'}`}
              >
                <Car className={`w-6 h-6 mb-3 ${deliveryType === 'local_partner' ? 'text-primary' : 'text-muted-foreground'}`} />
                <h3 className="font-semibold mb-1">Local Partner</h3>
                <p className="text-xs text-muted-foreground">Fastest. ₹30</p>
              </button>
            </div>

            {deliveryType !== 'pickup' && (
              <div className="mt-6 pt-6 border-t animate-in fade-in zoom-in-95 duration-300">
                <label className="block text-sm font-medium mb-2">Delivery Address / Apartment</label>
                <input 
                  type="text" 
                  placeholder="e.g. Flat 4B, Tower 2, Springfield Complex" 
                  className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  value="Flat 4B, Tower 2, Springfield Complex" // mocked prepopulated
                  readOnly
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Apartment security coordination available for this address.
                </p>
              </div>
            )}
          </section>

          {/* Payment Options */}
          <section className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                onClick={() => setPaymentMethod('online')}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${paymentMethod === 'online' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50 bg-background'}`}
              >
                <div>
                  <h3 className="font-semibold mb-1">Pay Online</h3>
                  <p className="text-xs text-muted-foreground">UPI / Cards / Wallets</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-primary' : 'border-muted'}`}>
                  {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </button>
              
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${paymentMethod === 'cash' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:border-primary/50 bg-background'}`}
              >
                <div>
                  <h3 className="font-semibold mb-1">Cash on Delivery</h3>
                  <p className="text-xs text-muted-foreground">Pay when you receive</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-primary' : 'border-muted'}`}>
                  {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-card border rounded-xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="font-bold text-xl mb-6">Summary</h3>
          
          <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {cart?.items.map(item => (
              <div key={item._id} className="flex justify-between text-sm">
                <span className="text-muted-foreground pr-4 line-clamp-1">{item.name} x {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 text-sm mb-6 pt-6 border-t">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Delivery Fee</span>
              <span className="font-medium text-foreground">
                {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-8 border-t pt-4">
             <span className="font-bold text-lg">Total</span>
             <span className="font-bold text-2xl text-primary">₹{total}</span>
          </div>
          
          <button 
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : paymentMethod === 'online' ? 'Pay & Place Order' : 'Place Order (COD)'}
          </button>
        </div>
      </div>
    </div>
  );
}

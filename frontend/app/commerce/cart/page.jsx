"use client";

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-sm">Looks like you haven&apos;t added anything to your cart from your local shops yet.</p>
        <Link href="/commerce" className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all shadow-sm">
          Browse Nearby Shops
        </Link>
      </div>
    );
  }

  const subtotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = 20; // Fixed delivery fee for mocking
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    // Navigate to orders/checkout page while keeping cart state
    router.push('/commerce/orders');
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <Link href={`/commerce/shop/${cart.shopId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Continue Shopping
        </Link>
        <button onClick={clearCart} className="text-sm text-destructive hover:text-destructive/80 transition-colors flex items-center">
          <Trash2 className="w-4 h-4 mr-1" /> Clear Cart
        </button>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item._id} className="flex flex-col sm:flex-row items-center justify-between bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex-1 w-full flex justify-between sm:justify-start items-center mb-4 sm:mb-0">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
                <div className="font-bold text-primary sm:ml-8 sm:w-20 sm:text-right text-lg">
                  ₹{item.price * item.quantity}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="flex items-center justify-between bg-secondary rounded-lg overflow-hidden w-28 border border-border/50">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-2 hover:bg-background/80 transition-colors text-foreground">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold w-8 text-center bg-background py-1.5">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-2 hover:bg-background/80 transition-colors text-foreground">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => removeItem(item._id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm h-fit sticky top-6">
          <h3 className="font-bold text-xl mb-6">Order Summary</h3>
          
          <div className="space-y-3 text-sm mb-6 pb-6 border-b">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal ({cart.items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
              <span className="font-medium text-foreground">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Delivery Fee</span>
              <span className="font-medium text-foreground">₹{deliveryFee}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">₹{total}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full flex items-center justify-center py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md group"
          >
            <CreditCard className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

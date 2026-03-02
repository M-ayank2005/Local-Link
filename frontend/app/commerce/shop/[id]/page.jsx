"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function ShopInventoryPage() {
  const params = useParams();
  const shopId = params.id;
  const { cart, addItem, removeItem, updateQuantity } = useCart();
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock API call
    setTimeout(() => {
      setShop({ name: 'Fresh Veggies Mart', address: 'Block A, Ground Floor' });
      setProducts([
        { _id: 'p1', name: 'Tomatoes', price: 40, category: 'Vegetables', description: 'Fresh local tomatoes (1kg)' },
        { _id: 'p2', name: 'Potatoes', price: 30, category: 'Vegetables', description: 'Organic potatoes (1kg)' },
        { _id: 'p3', name: 'Onions', price: 35, category: 'Vegetables', description: 'Red onions (1kg)' },
        { _id: 'p4', name: 'Milk', price: 65, category: 'Dairy', description: 'Full cream milk (1L)' },
      ]);
      setIsLoading(false);
    }, 600);
  }, [shopId]);

  const getItemQuantity = (productId) => {
    if (!cart || cart.shopId !== shopId) return 0;
    const item = cart.items.find(i => i._id === productId);
    return item ? item.quantity : 0;
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading shop details...</div>;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl animate-in slide-in-from-bottom-4 duration-500">
      <Link href="/commerce" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shops
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{shop?.name}</h1>
          <p className="text-muted-foreground mt-1">{shop?.address}</p>
        </div>
        
        {cart?.items?.length > 0 && (
          <Link href="/commerce/cart" className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90 transition-all">
            <ShoppingBag className="w-4 h-4 mr-2" />
            View Cart ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const quantity = getItemQuantity(product._id);
          
          return (
            <div key={product._id} className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <span className="font-bold text-primary">₹{product.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 mb-4">{product.description}</p>
                <span className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                  {product.category}
                </span>
              </div>
              
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                {quantity === 0 ? (
                  <button 
                    onClick={() => addItem(product, shopId)}
                    className="w-full flex items-center justify-center py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-full bg-secondary rounded-lg overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(product._id, quantity - 1)}
                      className="p-2 hover:bg-background/50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-8 text-center">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                      className="p-2 hover:bg-background/50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

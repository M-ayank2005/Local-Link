"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, MapPin, ChevronRight, Star } from 'lucide-react';

export default function CommercePage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mocking an API call to the backend
    setTimeout(() => {
      setShops([
        { _id: '1', name: 'Fresh Veggies Mart', address: 'Block A, Ground Floor', rating: 4.8, distance: '0.2km', isVerified: true },
        { _id: '2', name: 'Daily Needs Superstore', address: 'Main Gate Complex', rating: 4.5, distance: '0.5km', isVerified: true },
        { _id: '3', name: 'Sunrise Bakery', address: 'Block C, Street 2', rating: 4.9, distance: '0.8km', isVerified: true },
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nearby Shops</h1>
          <p className="text-muted-foreground flex items-center mt-1">
            <MapPin className="w-4 h-4 mr-1 text-primary" />
            Showing shops within 2km of your location
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Link href="/commerce/register-shop" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Register your shop
          </Link>
          <div className="flex items-center space-x-2 border-l pl-4 ml-4">
            <Link href="/commerce/orders/history" className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="My Orders">
                <Store className="w-5 h-5 hidden" />
                📦
            </Link>
            <Link href="/commerce/cart" className="relative p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="My Cart">
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-background"></span>
                🛒
            </Link>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-xl bg-card border shadow-sm animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map(shop => (
            <Link key={shop._id} href={`/commerce/shop/${shop._id}`}>
              <div className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{shop.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{shop.address}</p>
                    
                    <div className="flex items-center space-x-3 mt-4 text-sm font-medium">
                      <span className="flex items-center text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                        <Star className="w-3.5 h-3.5 mr-1 fill-current" /> {shop.rating}
                      </span>
                      <span className="text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {shop.distance}
                      </span>
                      {shop.isVerified && (
                        <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, MapPin, ChevronRight, Star } from 'lucide-react';

export default function CommercePage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const fetchShops = async (lng, lat) => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE_URL}/v1/commerce/shops?lng=${lng}&lat=${lat}&distance=10000`);
        // The endpoint may return { success: true, count: X, data: shops }
        // We'll safely parse and extract the array.
        if (res.ok) {
          const json = await res.json();
          const fetchedShops = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
          // Pre-process some fields for UI fallback if missing from DB schema
          const mappedShops = fetchedShops.map((s) => ({
            ...s,
            rating: s.rating || (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
            distance: s.distance || `${(Math.random() * 5).toFixed(1)}km`,
            isVerified: s.isVerified !== undefined ? s.isVerified : true,
          }));
          setShops(mappedShops);
        } else {
          console.error("Failed to fetch shops");
        }
      } catch (err) {
        console.error("Network error fetching shops", err);
      } finally {
        setIsLoading(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          fetchShops(position.coords.longitude, position.coords.latitude);
        },
        (error) => {
          console.log("Location access denied or failed. Using fallback.");
          setUserLocation({ lat: 28.6139, lng: 77.209 }); // Delhi fallback
          fetchShops(77.209, 28.6139);
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.209 }); // Delhi fallback
      fetchShops(77.209, 28.6139);
    }
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-primary/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-sky-400/20 dark:bg-sky-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 relative z-10 w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nearby Shops</h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1 text-primary" />
              Showing shops within 10000km of your location (Live + Mock Data)
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/commerce/register-shop" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Register your shop
            </Link>
            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-gray-800 pl-4 ml-4">
              <Link href="/commerce/orders/history" className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="My Orders">
                  <Store className="w-5 h-5 hidden" />
                  📦
              </Link>
              <Link href="/commerce/cart" className="relative p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors shadow-sm" title="My Cart">
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-background"></span>
                  🛒
              </Link>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-card border border-gray-200/50 dark:border-gray-800/50 shadow-sm animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map(shop => (
              <Link key={shop._id} href={`/commerce/shop/${shop._id}`}>
                <div className="group relative overflow-hidden rounded-3xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-card/60 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
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
    </div>
  );
}

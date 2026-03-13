"use client"; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Leaf, PlusCircle, ArrowLeft, ShieldAlert, User } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1); 
}

export default function FoodFeed() {
  const router = useRouter();
  const [availableFoods, setAvailableFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.log("Location access denied or failed.")
      );
    }
    fetchFood();
  }, []);

  const [claimQuantities, setClaimQuantities] = useState({});

  const handleQuantityChange = (id, value, max) => {
    const val = Math.max(1, Math.min(parseInt(value) || 1, max));
    setClaimQuantities(prev => ({ ...prev, [id]: val }));
  };

  const fetchFood = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/food`);
      const result = await response.json();
      setAvailableFoods(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch food", error);
      setLoading(false);
    }
  };

  const handleClaim = async (foodId, maxQty, price) => {
    try {
      const user = localStorage.getItem('user'); 
      if (!user) return alert("Please log in to claim food!");

      const qty = claimQuantities[foodId] || 1; 

      // Redirect to payment if price > 0
      if (price > 0) {
        router.push(`/food/checkout/${foodId}?qty=${qty}`);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/food/${foodId}/claim`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: qty })
      });

      if (response.ok) {
        alert("Food successfully claimed!");
        fetchFood(); 
      } else {
        const result = await response.json();
        alert(result.message || "Failed to claim food.");
      }
    } catch (error) {
      console.error("Error claiming food", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 dark:text-gray-400">Loading surplus food...</div>;

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full animate-in fade-in duration-500">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 text-xs md:text-sm font-semibold mb-3">
              <Leaf className="w-4 h-4" /> Food Rescue Network
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
              Rescue Surplus. <span className="text-emerald-600 dark:text-emerald-400">Share Joy.</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm md:text-base">
              Browse fresh, leftover food from neighbors and local restaurants. Claim it before it goes to waste and help build a hunger-free community.
            </p>
          </div>

          {isLoggedIn && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
               <Link href="/food/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-5 rounded-xl transition border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <User className="w-5 h-5" />
                <span>My Dashboard</span>
              </Link>
              <Link href="/food/create" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl transition shadow-sm hover:shadow-emerald-500/25 hover:-translate-y-0.5">
                <PlusCircle className="w-5 h-5" />
                <span>Post Food</span>
              </Link>
            </div>
          )}
        </header>

        {!isLoggedIn && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-center gap-3 shadow-sm backdrop-blur-sm">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <p>You are viewing as a guest. Please <Link href="/login" className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100">log in</Link> to claim or post food to the network.</p>
          </div>
        )}

        {availableFoods.length === 0 ? (
          <div className="text-center py-24 bg-white/70 dark:bg-card/60 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl transition-all duration-300">
            <Leaf className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">No surplus food available right now.</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Check back later or post some yourself!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableFoods.map((food) => {
              let distanceStr = "Distance unknown";
              if (userLocation && food.location?.coordinates) {
                distanceStr = `${calculateDistance(userLocation.lat, userLocation.lng, food.location.coordinates[1], food.location.coordinates[0])} km away`;
              }

              const isClaimed = food.status === 'claimed';
              const isPickedUp = food.status === 'picked_up';
              const validClaimQty = claimQuantities[food._id] || 1;

              return (
                <div key={food._id} className={`bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${(isClaimed || isPickedUp) ? 'border-gray-200/50 dark:border-gray-800/50 opacity-60 dark:bg-gray-900/30' : 'border-gray-200/50 dark:border-gray-800/50 hover:border-emerald-500/50'}`}>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className={`text-xl font-bold line-clamp-1 ${(isClaimed || isPickedUp) ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{food.title}</h2>
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        {food.season}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm h-10">{food.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <MapPin className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                        {distanceStr}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <Clock className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                        Expires: {new Date(food.expiryDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {food.ingredients && food.ingredients.map((ingredient, index) => (
                        <span key={index} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                          {ingredient}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {food.price === 0 ? 'Free' : `₹${food.price}`}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 font-medium">
                             Available: {food.quantity}
                          </span>
                        </div>

                         {food.status === 'available' && isLoggedIn && (
                           <div className="flex items-center border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                             <input 
                               type="number" 
                               min="1" 
                               max={food.quantity}
                               value={validClaimQty}
                               onChange={(e) => handleQuantityChange(food._id, e.target.value, food.quantity)}
                               className="w-16 p-2 text-center bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-bold"
                             />
                           </div>
                         )}
                      </div>
                      
                      {food.status === 'available' ? (
                        isLoggedIn ? (
                          <button 
                            onClick={() => handleClaim(food._id, food.quantity, food.price)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition shadow-sm hover:shadow"
                          >
                            {food.price > 0 ? 'Pay & Claim' : 'Claim'} {validClaimQty} Item(s)
                          </button>
                        ) : (
                          <Link href="/login" className="block text-center text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 transition-colors">
                            Log in to claim
                          </Link>
                        )
                      ) : (
                        <button disabled className={`w-full font-bold py-2.5 px-5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 ${
                          isPickedUp 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700' 
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50'
                        }`}>
                          {isPickedUp ? 'Completed' : 'Claimed (Waiting for Pickup)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
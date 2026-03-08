"use client"; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, Leaf, PlusCircle, ArrowLeft, ShieldAlert, User } from 'lucide-react';

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
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

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
      const response = await fetch('http://localhost:5000/api/food');
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
      const token = localStorage.getItem('authToken'); 
      if (!token) return alert("Please log in to claim food!");

      const qty = claimQuantities[foodId] || 1; 

      // Redirect to payment if price > 0
      if (price > 0) {
        router.push(`/food/checkout/${foodId}?qty=${qty}`);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/food/${foodId}/claim`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      
      {/* Arena Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg">
              <Leaf className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 hidden sm:block">
              Food Waste Management
            </h1>
          </div>
        </div>
        
        {isLoggedIn && (
          <div className="flex items-center gap-3">
             <Link href="/food/dashboard" className="flex items-center gap-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">My Dashboard</span>
            </Link>
            <Link href="/food/create" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm">
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Post Food</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Arena Hero Banner */}
      <div className="bg-emerald-600 dark:bg-emerald-900 text-white py-12 px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Rescue Surplus. Share Joy.</h2>
          <p className="text-emerald-100 dark:text-emerald-200 text-lg max-w-2xl">
            Browse fresh, leftover food from neighbors and local restaurants. Claim it before it goes to waste.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 max-w-7xl mx-auto -mt-8 relative z-10">
        {!isLoggedIn && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-center gap-3 shadow-sm backdrop-blur-sm">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <p>You are viewing as a guest. Please <Link href="/" className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100">log in</Link> to claim or post food to the network.</p>
          </div>
        )}

        {availableFoods.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
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
                <div key={food._id} className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border transition-all duration-300 hover:shadow-md ${(isClaimed || isPickedUp) ? 'border-gray-200 dark:border-gray-800 opacity-60 dark:bg-gray-900/50' : 'border-gray-200 dark:border-gray-800'}`}>
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
                          <span className="block text-center text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-800/50">
                            Log in to claim
                          </span>
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
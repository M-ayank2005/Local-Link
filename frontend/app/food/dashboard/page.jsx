"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, ShoppingBag, Truck, Calendar, Phone, User } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function FoodDashboard() {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' or 'claims'
  const [myListings, setMyListings] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]); // Orders on my listings
  const [myClaims, setMyClaims] = useState([]); // Orders I made
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);
    
    if (user) {
      Promise.all([
        fetchMyListings(), 
        fetchIncomingOrders(),
        fetchMyClaims()
      ])
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyListings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/food/my-posts`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) setMyListings(result.data);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  const fetchIncomingOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/food/my-incoming-orders`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) setIncomingOrders(result.data);
    } catch (error) {
      console.error("Failed to fetch incoming orders", error);
    }
  };

  const fetchMyClaims = async () => {
    try {
      // Logic changed: Now fetches FoodOrders, not FoodListings
      const response = await fetch(`${API_BASE_URL}/food/my-claims`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) setMyClaims(result.data);
    } catch (error) {
      console.error("Failed to fetch claims", error);
    }
  };

  const markAsDelivered = async (orderId) => {
    if (!confirm("Are you sure the food has been picked up? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/food/order/${orderId}/pickup`, {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        // Refresh orders
        fetchIncomingOrders();
      } else {
        const result = await response.json();
        alert(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error marking delivered", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950 dark:text-gray-400">Loading dashboard...</div>;

  if (!isLoggedIn) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center p-4">
         <p className="mb-4">You need to be logged in to view this page.</p>
         <Link href="/login" className="text-emerald-600 hover:underline">Go to Login</Link>
       </div>
     );
  }

  // Filter Listings
  const activeListings = myListings.filter(l => l.status === 'available' || (l.quantity > 0)); // active if qty > 0
  
  // Filter Incoming Orders
  const activeIncomingOrders = incomingOrders.filter(o => o.status === 'claimed');
  const completedIncomingOrders = incomingOrders.filter(o => o.status === 'picked_up');

  // Filter My Claims (Orders)
  const activeClaims = myClaims.filter(c => c.status === 'claimed'); 
  const historyClaims = myClaims.filter(c => c.status === 'picked_up');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
        <Link href="/food" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Food Dashboard</h1>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-6 font-medium text-lg transition-colors relative ${
              activeTab === 'listings' 
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            My Listings ({myListings.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-4 px-6 font-medium text-lg transition-colors relative ${
              activeTab === 'claims' 
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            My Claims ({myClaims.length})
          </button>
        </div>

        {/* My Listings Content */}
        {activeTab === 'listings' && (
          <div className="space-y-10">
            {/* Action Required: Incoming Orders to be Delivered */}
            {activeIncomingOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertCircle className="w-5 h-5" />
                  Action Required: Waiting for Pickup
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeIncomingOrders.map(order => (
                    <OrderCard 
                      key={order._id} 
                      order={order} 
                      type="posted"
                      onDelivered={() => markAsDelivered(order._id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* My Active Stock */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">My Active Stock</h2>
              {activeListings.length === 0 ? (
                <p className="text-gray-500 italic">You have no active listings.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeListings.map(listing => (
                     <ListingCard key={listing._id} listing={listing} />
                  ))}
                </div>
              )}
            </section>

             {/* Completed Deliveries */}
             {completedIncomingOrders.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">Delivered History</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedIncomingOrders.map(order => (
                    <OrderCard key={order._id} order={order} type="posted" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* My Claims Content */}
        {activeTab === 'claims' && (
          <div className="space-y-10">
            {/* Active Claims: To Pick Up */}
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
                Ready for Pickup
              </h2>
              {activeClaims.length === 0 ? (
                <p className="text-gray-500 italic">You have no active claims to pick up.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeClaims.map(claim => (
                    <OrderCard key={claim._id} order={claim} type="claimed" />
                  ))}
                </div>
              )}
            </section>

            {/* Received History */}
            {historyClaims.length > 0 && (
              <section>
                <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">Received History</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {historyClaims.map(claim => (
                    <OrderCard key={claim._id} order={claim} type="claimed" />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Card for a simple Food Listing (My Stock)
function ListingCard({ listing }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{listing.title}</h3>
        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs px-2 py-1 rounded-full font-medium">
          Available
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">{listing.description}</p>
      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 border-t pt-3 dark:border-gray-700">
         Stock: {listing.quantity}
      </div>
    </div>
  );
}

// Card for an Order (Transaction) - Uses FoodOrder data
function OrderCard({ order, type, onDelivered }) {
  const isPoster = type === 'posted';
  const status = order.status;
  
  // If I posted it, show who claimed it. If I claimed it, show who provided it.
  const contactUser = isPoster ? order.claimer : order.food?.provider;
  const itemTitle = order.food ? order.food.title : 'Deleted Item';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 transition-all hover:shadow-md ${
      status === 'claimed' && isPoster ? 'border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/10' : 
      status === 'picked_up' ? 'border-gray-200 dark:border-gray-700 opacity-75' : 
      'border-gray-100 dark:border-gray-700'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white truncate pr-2">{itemTitle}</h3>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          status === 'picked_up' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' :
          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
        }`}>
          {status === 'picked_up' ? 'Completed' : (isPoster ? 'Pending Pickup' : 'To Pickup')}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
          {isPoster ? 'Claimed By:' : 'Provided By:'}
        </p>
        <div className="flex items-center gap-2">
           <User className="w-4 h-4 text-gray-400" />
           <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{contactUser?.fullName || 'Unknown'}</span>
        </div>
        {contactUser?.phone && (
          <div className="flex items-center gap-2 mt-1">
             <Phone className="w-4 h-4 text-emerald-500" />
             <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{contactUser.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
           {order.quantity} <span className="text-xs text-gray-400 font-normal">units</span>
        </div>

        {status === 'claimed' && isPoster && (
          <button 
            onClick={onDelivered}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Delivered
          </button>
        )}

        {status === 'claimed' && !isPoster && (
           <div className="text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
             <Truck className="w-3 h-3" />
             Awaiting Pickup
           </div>
        )}
      </div>
    </div>
  );
}
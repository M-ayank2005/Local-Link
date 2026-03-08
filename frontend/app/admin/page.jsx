"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Store } from 'lucide-react';

export default function AdminPage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/v1/admin/shops`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
          setShops(items.map(s => ({
            _id: s._id,
            name: s.name,
            owner: s.owner?.fullName || s.owner || 'Unknown',
            status: s.status || 'pending',
            submittedAt: new Date(s.createdAt || Date.now()).toLocaleDateString()
          })));
        } else {
          console.error("Failed to fetch admin shops");
        }
      } catch (err) {
        console.error("Network error fetching admin shops", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/v1/admin/shops/${id}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setShops(shops.map(shop => shop._id === id ? { ...shop, status } : shop));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating status");
    }
  };

  const handleVerify = (id) => updateStatus(id, 'verified');
  const handleReject = (id) => updateStatus(id, 'rejected');

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full animate-in fade-in duration-500">
      <header className="mb-8 pb-6 border-b flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3" /> Admin Portal
          </h1>
          <p className="text-muted-foreground mt-2">Approve and monitor local shop registrations.</p>
        </div>
        
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center space-x-6">
           <div className="text-center">
             <span className="block text-2xl font-bold">{shops.filter(s => s.status === 'pending').length}</span>
             <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending</span>
           </div>
           <div className="w-px h-10 bg-border"></div>
           <div className="text-center">
             <span className="block text-2xl font-bold text-emerald-500">{shops.filter(s => s.status === 'verified').length}</span>
             <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Verified</span>
           </div>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl border bg-card animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {shops.map((shop) => (
            <div key={shop._id} className="bg-card border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-all hover:shadow-md hover:border-primary/30">
              
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <div className={`p-3 rounded-xl mt-1 ${
                  shop.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                  shop.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    {shop.name}
                    {shop.status === 'verified' && <CheckCircle2 className="w-4 h-4 ml-2 text-emerald-500" />}
                  </h3>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p>Owner: <span className="font-medium text-foreground">{shop.owner}</span></p>
                    <p>Applied: {shop.submittedAt}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:ml-auto">
                <div className="mr-8 hidden md:block">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border
                    ${shop.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      shop.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                    {shop.status}
                  </span>
                </div>

                {shop.status === 'pending' ? (
                  <>
                    <button 
                      onClick={() => handleReject(shop._id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors group flex items-center"
                    >
                      <XCircle className="w-5 h-5 mr-1" /> <span className="text-sm font-medium">Reject</span>
                    </button>
                    <button 
                      onClick={() => handleVerify(shop._id)}
                      className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors group flex items-center"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-1" /> <span className="text-sm font-medium">Approve</span>
                    </button>
                  </>
                ) : (
                  <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                    View Full Profile
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Store } from 'lucide-react';

export default function AdminPage() {
  const [shops, setShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mocking API fetch for admin shops
    setTimeout(() => {
      setShops([
        { _id: '1', name: 'Fresh Veggies Mart', owner: 'Ramesh Gupta', status: 'pending', submittedAt: '2 days ago' },
        { _id: '2', name: 'Daily Needs Superstore', owner: 'Anita Singh', status: 'verified', submittedAt: '1 week ago' },
        { _id: '3', name: 'Sunrise Bakery', owner: 'John Paul', status: 'pending', submittedAt: '5 hours ago' },
        { _id: '4', name: 'Green Medicos', owner: 'Dr. Sharma', status: 'rejected', submittedAt: '2 weeks ago' },
      ]);
      setIsLoading(false);
    }, 600);
  }, []);

  const handleVerify = (id) => {
    setShops(shops.map(shop => 
      shop._id === id ? { ...shop, status: 'verified' } : shop
    ));
  };

  const handleReject = (id) => {
    setShops(shops.map(shop => 
      shop._id === id ? { ...shop, status: 'rejected' } : shop
    ));
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl animate-in fade-in duration-500">
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
  );
}

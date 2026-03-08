"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, MapPin, ArrowLeft, ChevronRight, Store } from 'lucide-react';

// Removed MOCK_ORDERS

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real order history
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/commerce/orders/my`, {
          headers: { ...(token && { Authorization: `Bearer ${token}` }) }
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const mappedOrders = (Array.isArray(data) ? data : []).map(o => ({
            id: o._id,
            shopName: o.shop?.name || o.shopName || 'Unknown Shop',
            date: o.createdAt || o.date || new Date().toISOString(),
            total: o.totalAmount || o.total || 0,
            status: o.status || 'pending',
            items: o.items || [],
            deliveryType: o.deliveryType || 'pickup'
          }));
          setOrders(mappedOrders);
        } else {
          console.error("Failed to fetch orders");
        }
      } catch (err) {
        console.error("Network error fetching orders", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'delivered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3 mr-1"/> Delivered</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3 h-3 mr-1 animate-pulse"/> Processing</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{status}</span>;
    }
  };

  const getDeliveryText = (type) => {
    switch(type) {
      case 'pickup': return "Store Pickup";
      case 'shop-staff': return "Shop Staff Delivery";
      case 'local-partner': return "Local Partner Delivery";
      default: return type;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl animate-in fade-in duration-500">
      <header className="mb-8">
        <Link href="/commerce" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Commerce Hub
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Your Order History</h1>
        <p className="text-muted-foreground mt-1">Track your recent purchases and view past receipts.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border bg-card animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-6">You haven&apos;t placed any orders yet.</p>
          <Link href="/commerce" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 md:p-6 bg-muted/20 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-semibold text-lg flex items-center">
                       <Store className="w-4 h-4 mr-1.5 text-primary" /> {order.shopName}
                    </h3>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1">
                     <span className="font-mono">{order.id}</span>
                     <span>•</span>
                     <span>{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     <span>•</span>
                     <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1"/> {getDeliveryText(order.deliveryType)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-bold text-xl">₹{order.total}</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-3">Order Items:</p>
                  <ul className="space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span className="text-foreground"><span className="text-muted-foreground mr-2">{item.quantity}x</span> {item.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-end md:justify-center border-t md:border-t-0 pt-4 md:pt-0">
                   <button className="text-primary text-sm font-medium hover:underline flex items-center">
                     View Receipt <ChevronRight className="w-4 h-4 ml-1" />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

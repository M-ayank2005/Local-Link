"use client";

import { use, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function CheckoutContent({ id }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qty = parseInt(searchParams.get('qty') || '1', 10);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/food/${id}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) setFood(result.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePayment = async () => {
    try {
      setPaying(true);
      const user = localStorage.getItem('user');
      if (!user) {
        alert("Please log in first.");
        setPaying(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/food/${id}/claim`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ quantity: qty })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Payment Successful! Food Claimed.");
        router.push('/food/dashboard');
      } else {
        alert(result.message || "Payment Failed");
        setPaying(false);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setPaying(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading checkout...</div>;
  if (!food) return (
    <div className="p-10 text-center">
      <p className="text-gray-600 mb-4">Food item not found or no longer available.</p>
      <Link href="/food" className="text-emerald-600 hover:underline">← Back to feed</Link>
    </div>
  );

  const total = food.price * qty;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg max-w-md w-full border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-gray-800">
          <Link href="/food" className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Checkout
          </h1>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Item:</span>
            <span className="font-medium text-gray-900 dark:text-white">{food.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
            <span className="font-medium text-gray-900 dark:text-white">{qty}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Price per unit:</span>
            <span className="font-medium text-gray-900 dark:text-white">₹{food.price}</span>
          </div>
          <div className="flex justify-between pt-4 border-t dark:border-gray-700 border-dashed">
            <span className="text-lg font-bold text-gray-800 dark:text-gray-100">Total:</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{total}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={paying}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          {paying ? 'Processing...' : `Pay ₹${total} & Claim`}
        </button>

        <p className="text-xs text-center text-gray-400 mt-4">
          Demo payment — no real money is deducted.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage({ params }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading checkout...</div>}>
      <CheckoutContent id={id} />
    </Suspense>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';

export default function BookResourcePage() {
  const { id } = useParams();
  const router = useRouter();

  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [days, setDays] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [highRiskWarning, setHighRiskWarning] = useState(null);
  const [confirmedHighRisk, setConfirmedHighRisk] = useState(false);
  const [success, setSuccess] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await fetch(`${API_BASE}/resources/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResource(data.data);
      } catch {
        // Dev fallback
        setResource({
          _id: id,
          title: 'Epson Projector 3000 Lumens',
          category: 'projector',
          condition: 'new',
          pricePerDay: 200,
          depositAmount: 2000,
          owner: { fullName: 'Amit Shah' },
          availableFrom: '2026-01-01',
          availableTo: '2026-12-31',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  // Recalculate total days whenever dates change
  useEffect(() => {
    if (fromDate && toDate) {
      const diff = (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24);
      setDays(diff > 0 ? diff : 0);
    } else {
      setDays(0);
    }
  }, [fromDate, toDate]);

  const totalRent = days * (resource?.pricePerDay || 0);
  const totalPayable = totalRent + (resource?.depositAmount || 0);

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setHighRiskWarning(null);

    if (!token) {
      setError('Please log in to book a resource.');
      return;
    }
    if (days <= 0) {
      setError('Please select valid dates.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          resourceId: id,
          fromDate,
          toDate,
          paymentMethod,
          confirmedHighRisk,
        }),
      });
      const data = await res.json();

      if (res.status === 202 && data.requires_extra_confirmation) {
        // ML detected high no-show risk — ask user to confirm
        setHighRiskWarning(data);
        setBookingLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setSuccess(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleConfirmHighRisk = () => {
    setConfirmedHighRisk(true);
    setHighRiskWarning(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="h-64 rounded-2xl bg-card border animate-pulse max-w-lg mx-auto" />
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="container mx-auto p-8 max-w-lg text-center space-y-5">
        <div className="p-5 bg-emerald-500/10 rounded-full inline-block">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
        <div className="rounded-2xl border bg-card p-5 text-left space-y-2 text-sm">
          <p><span className="text-muted-foreground">Booking ID:</span> <span className="font-mono text-xs">{success._id}</span></p>
          <p><span className="text-muted-foreground">Total Rent:</span> ₹{success.totalRent}</p>
          <p><span className="text-muted-foreground">Deposit Held:</span> ₹{success.depositAmount}</p>
          <p><span className="text-muted-foreground">From:</span> {new Date(success.fromDate).toLocaleDateString()}</p>
          <p><span className="text-muted-foreground">To:</span> {new Date(success.toDate).toLocaleDateString()}</p>
          <p><span className="text-muted-foreground">Status:</span> <span className="text-emerald-500 font-medium">confirmed</span></p>
          {success.ml_risk_level && (
            <p><span className="text-muted-foreground">Risk level:</span> {success.ml_risk_level}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/resources/my-items"
            className="flex-1 py-3 rounded-xl border text-sm font-medium hover:bg-muted transition-colors text-center"
          >
            My bookings
          </Link>
          <Link
            href="/resources"
            className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors text-center"
          >
            Browse more
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-lg space-y-6">
      <Link href={`/resources/item/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to item
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Book this item</h1>
        <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
          <Wrench className="w-3.5 h-3.5 text-amber-500" />
          {resource?.title} · {resource?.owner?.fullName}
        </p>
      </div>

      {/* High risk warning banner */}
      {highRiskWarning && (
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-600 dark:text-orange-400">High no-show risk detected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Our ML model flagged your booking history ({(highRiskWarning.ml_no_show_probability * 100).toFixed(0)}% no-show probability). The owner may require extra assurance.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setHighRiskWarning(null)}
              className="flex-1 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmHighRisk}
              className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Proceed anyway
            </button>
          </div>
        </div>
      )}

      {/* Booking form */}
      <form onSubmit={handleBook} className="space-y-5">
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">From date</label>
              <input
                type="date"
                required
                value={fromDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">To date</label>
              <input
                type="date"
                required
                value={toDate}
                min={fromDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-background text-foreground text-sm focus:ring-2 focus:ring-amber-500/50 outline-none"
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        {/* Price summary */}
        {days > 0 && (
          <div className="rounded-2xl border bg-card p-5 space-y-3 text-sm">
            <h3 className="font-semibold">Price summary</h3>
            <div className="flex justify-between text-muted-foreground">
              <span>₹{resource?.pricePerDay}/day × {days} day{days > 1 ? 's' : ''}</span>
              <span className="text-foreground font-medium">₹{totalRent}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Refundable deposit</span>
              <span className="text-foreground font-medium">₹{resource?.depositAmount}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total payable</span>
              <span className="text-amber-500">₹{totalPayable}</span>
            </div>
          </div>
        )}

        {/* Deposit note */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-secondary rounded-xl p-4">
          <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <span>
            Deposit is held securely and refunded in full on safe return. Cancellation &gt;48h before start = full refund. &lt;48h = 50% refund. After pickup = no refund.
          </span>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={bookingLoading || days <= 0}
          className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {bookingLoading ? 'Processing...' : `Confirm & Pay ₹${totalPayable}`}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Wrench, TrendingUp, CalendarDays, Shield } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';

const CONDITION_COLORS = {
  new: 'text-emerald-500 bg-emerald-500/10',
  good: 'text-amber-500 bg-amber-500/10',
  fair: 'text-orange-500 bg-orange-500/10',
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/resources/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load resource');
        setResource(data.data);
      } catch (err) {
        setError(err.message);
        setResource(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <div className="h-8 w-40 rounded-xl bg-card border animate-pulse" />
        <div className="h-64 rounded-2xl bg-card border animate-pulse" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto p-8 text-center text-muted-foreground">
        <p>Resource not found.</p>
        <Link href="/resources" className="text-amber-500 hover:underline mt-2 inline-block">← Back to listings</Link>
      </div>
    );
  }

  const forecast = resource.ml_demand_forecast;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl space-y-6">
      {/* Back */}
      <Link href="/resources" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> All resources
      </Link>

      {/* Error banner */}
      {error && (
        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
          Backend unreachable — showing sample data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-5">
          {/* Image placeholder */}
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 h-52 flex items-center justify-center">
            <Wrench className="w-16 h-16 text-amber-400 opacity-50" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full capitalize">
                {resource.category}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_COLORS[resource.condition]}`}>
                {resource.condition}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{resource.title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{resource.description}</p>
          </div>

          {/* Rules */}
          {resource.rules && (
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="text-sm font-semibold mb-1 flex items-center gap-1">
                <Shield className="w-4 h-4 text-amber-500" /> Owner Rules
              </h3>
              <p className="text-sm text-muted-foreground">{resource.rules}</p>
            </div>
          )}

          {/* Booked dates calendar */}
          {resource.bookedDates?.length > 0 && (
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-amber-500" /> Already booked
              </h3>
              <ul className="space-y-1">
                {resource.bookedDates.map((range, i) => (
                  <li key={i} className="text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg">
                    {new Date(range.from).toLocaleDateString()} → {new Date(range.to).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing card */}
          <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
            <p className="text-3xl font-bold text-amber-500">₹{resource.pricePerDay}<span className="text-sm font-normal text-muted-foreground">/day</span></p>
            <div className="text-sm text-muted-foreground">
              Deposit: <span className="font-medium text-foreground">₹{resource.depositAmount}</span>
              <span className="block text-xs mt-0.5">Refunded on safe return</span>
            </div>

            <Link
              href={`/resources/book/${resource._id}`}
              className="w-full block text-center py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm"
            >
              Book This Item
            </Link>
          </div>

          {/* Owner card */}
          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold">Owner</h3>
            <p className="font-medium">{resource.owner?.fullName}</p>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{resource.owner?.rating?.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({resource.owner?.totalReviews} reviews)</span>
            </div>
          </div>

          {/* ML Demand Forecast */}
          <div className="rounded-2xl border bg-card p-4 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-violet-500" /> Demand Forecast
            </h3>
            {forecast?.source === 'unavailable' ? (
              <p className="text-xs text-muted-foreground">ML service unavailable</p>
            ) : (
              <>
                <p className="text-lg font-bold">{forecast?.predicted_bookings_next_7_days} bookings</p>
                <p className="text-xs text-muted-foreground">expected next 7 days</p>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full"
                    style={{ width: `${(forecast?.confidence ?? 0) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{((forecast?.confidence ?? 0) * 100).toFixed(0)}% confidence</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

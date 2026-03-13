"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Wrench, Search, Filter, Star, TrendingUp } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api/v1';

const CATEGORY_LABELS = {
  drill: 'Drill',
  ladder: 'Ladder',
  projector: 'Projector',
  tent: 'Tent',
  tool: 'Tool',
  appliance: 'Appliance',
  sports: 'Sports',
  other: 'Other',
};

const CONDITION_COLORS = {
  new: 'text-emerald-500 bg-emerald-500/10',
  good: 'text-amber-500 bg-amber-500/10',
  fair: 'text-orange-500 bg-orange-500/10',
};

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mlRanked, setMlRanked] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const fetchResources = async (coords) => {
    setIsLoading(true);
    setError('');
    try {
      const { lng, lat } = coords;
      const params = new URLSearchParams({ lng, lat, distance: 10000 });
      if (category) params.append('category', category);

      const res = await fetch(`${API_BASE}/resources?${params}`, { 
        credentials: 'include' 
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch resources');
      setResources(data.data || []);
      setMlRanked(data.ml_ranked || false);
    } catch (err) {
      setError(err.message);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lng: pos.coords.longitude, lat: pos.coords.latitude };
          setUserCoords(coords);
          setIsLocating(false);
          fetchResources(coords);
        },
        () => {
          // Fallback to Delhi coordinates for development
          const fallback = { lng: 77.209, lat: 28.6139 };
          setUserCoords(fallback);
          setIsLocating(false);
          fetchResources(fallback);
        }
      );
    } else {
      const fallback = { lng: 77.209, lat: 28.6139 };
      setUserCoords(fallback);
      setIsLocating(false);
      fetchResources(fallback);
    }
  };

  useEffect(() => {
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userCoords) fetchResources(userCoords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const filtered = resources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 dark:bg-amber-600/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-orange-400/20 dark:bg-orange-600/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full animate-in fade-in duration-500">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="w-7 h-7 text-amber-500" />
            Shared Resource Pool
          </h1>
          <p className="text-muted-foreground flex items-center mt-1 text-sm">
            <MapPin className="w-4 h-4 mr-1 text-amber-500" />
            Peer-to-peer rental of tools, projectors, tents and more
          </p>
          {mlRanked && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> ML-ranked by relevance
            </span>
          )}
        </div>
        <Link
          href="/resources/my-items"
          className="px-4 py-2 rounded-xl border border-amber-500 text-amber-500 hover:bg-amber-500/10 text-sm font-medium transition-colors"
        >
          + List my item
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-amber-500/50 outline-none text-sm"
          >
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 text-sm bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
          Backend unreachable — showing sample data. {error}
        </div>
      )}

      {/* Grid */}
      {isLoading || isLocating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-card border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No resources found nearby</p>
          <p className="text-sm mt-1">Be the first to list something!</p>
          <Link
            href="/resources/my-items"
            className="mt-4 inline-block px-5 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            List an item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource) => (
            <Link key={resource._id} href={`/resources/item/${resource._id}`}>
              <div className="group relative overflow-hidden rounded-3xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-card/60 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/50 cursor-pointer">
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[resource.category] || resource.category}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_COLORS[resource.condition]}`}>
                    {resource.condition}
                  </span>
                </div>

                <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-amber-500 transition-colors">
                  {resource.title}
                </h3>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{resource.owner?.rating?.toFixed(1) ?? '—'}</span>
                  <span className="mx-1">·</span>
                  <span>{resource.owner?.fullName}</span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-amber-500">₹{resource.pricePerDay}<span className="text-xs font-normal text-muted-foreground">/day</span></p>
                    <p className="text-xs text-muted-foreground">Deposit: ₹{resource.depositAmount}</p>
                  </div>
                  {resource.ml_score !== null && resource.ml_score !== undefined && (
                    <span className="text-xs text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full">
                      Score {(resource.ml_score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* My Bookings link */}
      <div className="pt-4 border-t text-center">
        <Link href="/resources/my-items" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          View my listings & bookings →
        </Link>
      </div>
      </div>
    </div>
  );
}

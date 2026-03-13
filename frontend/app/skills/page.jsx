"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Star,
  Search,
  Filter,
  ChevronRight,
  ArrowLeft,
  User,
  Clock,
  BadgeCheck,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  { value: 'all', label: 'All Services', icon: '🔧' },
  { value: 'electrician', label: 'Electrician', icon: '⚡' },
  { value: 'plumber', label: 'Plumber', icon: '🔧' },
  { value: 'carpenter', label: 'Carpenter', icon: '🪚' },
  { value: 'tutor', label: 'Tutor', icon: '📚' },
  { value: 'cleaner', label: 'Cleaner', icon: '🧹' },
  { value: 'painter', label: 'Painter', icon: '🎨' },
  { value: 'mechanic', label: 'Mechanic', icon: '🔩' },
  { value: 'helper', label: 'Helper', icon: '🤝' },
  { value: 'cook', label: 'Cook', icon: '👨‍🍳' },
  { value: 'driver', label: 'Driver', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'reviews', label: 'Most Reviews' },
];

export default function SkillsPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!user);

    // Check if user is a service provider from cached user data
    if (user) {
      const userData = JSON.parse(user);
      const userRole = userData.role;
      setIsProvider(userRole === 'service_provider' || userRole === 'admin');
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
        () => console.log("Location access denied")
      );
    }
  }, []);

  // Role check is now handled via localStorage or could be refreshed via /me
  // checkUserRole function removed as we rely on /me for session and localStorage for hints

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortBy, page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy,
      });

      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', '20');
      }

      const response = await fetch(`${API_BASE_URL}/v1/skills/services?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else {
        setServices([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

// Removed getMockServices()

  const getCategoryIcon = (cat) => {
    return CATEGORIES.find(c => c.value === cat)?.icon || '📋';
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground transition-colors duration-300 relative">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/20 dark:bg-violet-600/20 blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-600/10 blur-[100px] pointer-events-none -z-10 animate-pulse delay-1000" />
      
      <div className="container mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full animate-in fade-in duration-500">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 text-violet-600 text-xs md:text-sm font-semibold mb-3">
              <Briefcase className="w-4 h-4" /> Professional Network
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-gray-900 dark:text-white">
              Skill & Service <span className="text-violet-600 dark:text-violet-400">Exchange</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl text-sm md:text-base">
              Book verified electricians, plumbers, tutors, and more right from your neighborhood. Fast, reliable, and entirely transparent.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            {isLoggedIn && (
              <>
                <Link
                  href="/skills/bookings"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-5 rounded-xl transition border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                >
                  <Clock className="w-5 h-5" />
                  <span>My Bookings</span>
                </Link>
                {isProvider && (
                  <Link
                    href="/skills/dashboard"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-5 rounded-xl transition shadow-sm hover:shadow-violet-500/25 hover:-translate-y-0.5"
                  >
                    <User className="w-5 h-5" />
                    <span>Provider Dashboard</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </header>

        {/* Search & Filters */}
        <div className="bg-white/70 dark:bg-card/60 backdrop-blur-xl rounded-2xl shadow-sm p-4 md:p-6 border border-gray-200/50 dark:border-gray-800/50 relative overflow-hidden">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for services, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition flex items-center justify-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </form>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <MapPin className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userLocation ? 'Using your location' : 'Location not available'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  category === cat.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-violet-400'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold">{services.length}</span> of <span className="font-semibold">{total}</span> services
          </p>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">No services found</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link key={service._id} href={`/skills/provider/${service._id}`}>
                <div className="group relative overflow-hidden rounded-3xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-card/60 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-violet-400/50 dark:hover:border-violet-500/50">
                  <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <ChevronRight className="w-5 h-5 text-violet-600" />
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-2xl">
                      {getCategoryIcon(service.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg truncate">{service.title}</h3>
                        {service.isVerified && (
                          <BadgeCheck className="w-5 h-5 text-violet-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        by {service.provider?.fullName || 'Provider'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      {service.rating?.toFixed(1) || '0.0'}
                      <span className="text-gray-400 font-normal">({service.totalReviews || 0})</span>
                    </span>

                    {service.distance && (
                      <span className="flex items-center gap-1 text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-sm">
                        <MapPin className="w-3 h-3" />
                        {service.distance.toFixed(1)} km
                      </span>
                    )}

                    <span className="text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg text-sm">
                      {service.experience || 0} yrs exp
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-2xl font-bold text-violet-600">₹{service.pricePerHour}</span>
                      <span className="text-sm text-gray-400">/hour</span>
                    </div>
                    <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

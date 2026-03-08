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
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    // Check if user is a service provider from cached user data
    if (token) {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          const userRole = userData.role;
          setIsProvider(userRole === 'service_provider' || userRole === 'admin');
        } catch (e) {
          checkUserRole(token);
        }
      } else {
        checkUserRole(token);
      }
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

  const checkUserRole = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // API returns { user: { role: ... } }
        const userRole = data.user?.role || data.data?.role || data.role;
        setIsProvider(userRole === 'service_provider' || userRole === 'admin');
      }
    } catch (error) {
      console.log('Role check failed');
    }
  };

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
        // Use mock data for demo if API not available
        setServices(getMockServices());
        setTotal(getMockServices().length);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices(getMockServices());
      setTotal(getMockServices().length);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const getMockServices = () => [
    {
      _id: '1',
      title: 'Expert Electrician Service',
      category: 'electrician',
      description: 'Professional electrical repairs, wiring, and installations with 10+ years experience.',
      pricePerHour: 300,
      rating: 4.8,
      totalReviews: 45,
      experience: 10,
      isVerified: true,
      provider: { fullName: 'Rajesh Kumar', profileImage: '', isVerified: true },
      distance: 1.2,
    },
    {
      _id: '2',
      title: 'Home Tutor - Math & Science',
      category: 'tutor',
      description: 'Experienced tutor for classes 6-12. Board exam preparation specialist.',
      pricePerHour: 500,
      rating: 4.9,
      totalReviews: 72,
      experience: 8,
      isVerified: true,
      provider: { fullName: 'Priya Sharma', profileImage: '', isVerified: true },
      distance: 0.8,
    },
    {
      _id: '3',
      title: 'Professional Plumbing Service',
      category: 'plumber',
      description: 'All plumbing solutions - leak repairs, pipe fitting, bathroom installations.',
      pricePerHour: 250,
      rating: 4.6,
      totalReviews: 38,
      experience: 6,
      isVerified: false,
      provider: { fullName: 'Mohan Singh', profileImage: '', isVerified: false },
      distance: 2.1,
    },
    {
      _id: '4',
      title: 'House Cleaning Service',
      category: 'cleaner',
      description: 'Deep cleaning, regular cleaning, and move-in/move-out cleaning services.',
      pricePerHour: 200,
      rating: 4.7,
      totalReviews: 56,
      experience: 4,
      isVerified: true,
      provider: { fullName: 'Sunita Devi', profileImage: '', isVerified: true },
      distance: 1.5,
    },
    {
      _id: '5',
      title: 'Carpentry & Woodwork',
      category: 'carpenter',
      description: 'Custom furniture, repairs, and all types of wooden work.',
      pricePerHour: 350,
      rating: 4.5,
      totalReviews: 29,
      experience: 12,
      isVerified: true,
      provider: { fullName: 'Ramesh Verma', profileImage: '', isVerified: true },
      distance: 3.0,
    },
    {
      _id: '6',
      title: 'Home Cook Service',
      category: 'cook',
      description: 'Daily cooking service for families. North & South Indian cuisine.',
      pricePerHour: 300,
      rating: 4.8,
      totalReviews: 41,
      experience: 7,
      isVerified: true,
      provider: { fullName: 'Lakshmi Iyer', profileImage: '', isVerified: true },
      distance: 1.8,
    },
  ];

  const getCategoryIcon = (cat) => {
    return CATEGORIES.find(c => c.value === cat)?.icon || '📋';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100/70 via-blue-50 to-purple-100/60 dark:from-background dark:via-background dark:to-background">
      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-20 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-lg">
              <Briefcase className="text-violet-600 dark:text-violet-400 w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 hidden sm:block">
              Skill Exchange
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <>
              <Link
                href="/skills/bookings"
                className="flex items-center gap-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-lg transition shadow-sm"
              >
                <Clock className="w-5 h-5" />
                <span className="hidden sm:inline">My Bookings</span>
              </Link>
              {isProvider && (
                <Link
                  href="/skills/dashboard"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 px-4 rounded-lg transition shadow-sm"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Provider Dashboard</span>
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-violet-600 dark:bg-violet-900 text-white py-12 px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Find Trusted Local Professionals</h2>
          <p className="text-violet-100 dark:text-violet-200 text-lg max-w-2xl">
            Book verified electricians, plumbers, tutors, and more from your neighborhood. Fast, reliable, and affordable.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8 max-w-7xl mx-auto -mt-6 relative z-10">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 md:p-6 mb-6 border border-gray-100 dark:border-gray-800">
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
                <div className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow-sm transition-all hover:shadow-lg hover:border-violet-400 dark:border-gray-800">
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

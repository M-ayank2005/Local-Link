"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  Users,
  IndianRupee,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Phone,
  MapPin,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const CATEGORIES = [
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

export default function ProviderDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // New service form
  const [newService, setNewService] = useState({
    title: '',
    category: 'electrician',
    description: '',
    pricePerHour: '',
    experience: '',
    skills: '',
    serviceRadius: 5,
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    if (!token) {
      router.push('/login');
      return;
    }

    // Check user role from cached user data first
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        const userRole = userData.role;
        const isServiceProvider = userRole === 'service_provider' || userRole === 'admin';
        setIsProvider(isServiceProvider);
        setCheckingRole(false);
        
        if (isServiceProvider) {
          fetchDashboardData();
        } else {
          setLoading(false);
        }
      } catch (e) {
        checkUserRole(token);
      }
    } else {
      checkUserRole(token);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserRole = async (token) => {
    try {
      // Fetch user profile to check role
      const response = await fetch(`${API_BASE_URL}/v1/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // API returns { user: { role: ... } }
        const userRole = data.user?.role || data.data?.role || data.role;
        const isServiceProvider = userRole === 'service_provider' || userRole === 'admin';
        setIsProvider(isServiceProvider);
        
        if (isServiceProvider) {
          fetchDashboardData();
        } else {
          setLoading(false);
        }
      } else {
        // API failed - deny access by default
        setIsProvider(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      // On error - deny access for security
      setIsProvider(false);
      setLoading(false);
    } finally {
      setCheckingRole(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch dashboard stats
      const statsRes = await fetch(`${API_BASE_URL}/v1/skills/provider/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      // Fetch services
      const servicesRes = await fetch(`${API_BASE_URL}/v1/skills/provider/services`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      // Fetch bookings
      const bookingsRes = await fetch(`${API_BASE_URL}/v1/skills/provider/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      } else {
        setStats(null);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.data || []);
      } else {
        setServices([]);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.data || []);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(null);
      setServices([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

// Removed getMockStats, getMockServices, getMockBookings

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/v1/skills/provider/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  const handleToggleService = async (serviceId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/v1/skills/provider/services/${serviceId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (response.ok) {
        fetchDashboardData();
      } else {
        alert('Failed to toggle service');
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      alert('Network error toggling service');
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const serviceData = {
        ...newService,
        pricePerHour: Number(newService.pricePerHour),
        experience: Number(newService.experience),
        skills: newService.skills.split(',').map(s => s.trim()).filter(Boolean),
        location: {
          type: 'Point',
          coordinates: userLocation ? [userLocation.lng, userLocation.lat] : [77.209, 28.6139],
        },
        address: { city: 'Noida', state: 'UP' },
      };

      const response = await fetch(`${API_BASE_URL}/v1/skills/provider/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(serviceData),
      });

      if (response.ok) {
        setShowNewServiceModal(false);
        setNewService({
          title: '',
          category: 'electrician',
          description: '',
          pricePerHour: '',
          experience: '',
          skills: '',
          serviceRadius: 5,
        });
        fetchDashboardData();
      } else {
        alert('Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Network error creating service');
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryIcon = (cat) => {
    return CATEGORIES.find(c => c.value === cat)?.icon || '📋';
  };

  if (!isLoggedIn || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  // Show "Become a Provider" page if user is not a provider
  if (!isProvider) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Link href="/skills" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-lg">
                <Briefcase className="text-violet-600 dark:text-violet-400 w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100">Provider Dashboard</span>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-800 text-center">
            <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10 text-violet-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Service Provider Access Only</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              This dashboard is only accessible to users registered with the &quot;Service Provider&quot; role. 
              You can change your role in your profile settings or register a new account as a Service Provider.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition"
              >
                <Settings className="w-5 h-5" />
                Go to Profile
              </Link>
              <Link
                href="/skills"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-xl transition"
              >
                Browse Services
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              If you recently changed your role, try refreshing or logging in again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/skills" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-lg">
                <Briefcase className="text-violet-600 dark:text-violet-400 w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100">Provider Dashboard</span>
            </div>
          </div>
          <button
            onClick={() => setShowNewServiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Bookings</span>
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-3xl font-bold">{stats?.bookingStats?.totalBookings || 0}</p>
            <p className="text-xs text-green-500 mt-1">
              {stats?.bookingStats?.pendingBookings || 0} pending
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Revenue</span>
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">₹{(stats?.bookingStats?.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">
              from {stats?.bookingStats?.completedBookings || 0} completed
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Rating</span>
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{stats?.reviewStats?.avgRating?.toFixed(1) || '0.0'}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats?.reviewStats?.totalReviews || 0} reviews
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Active Services</span>
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{services.filter(s => s.isActive).length}</p>
            <p className="text-xs text-gray-400 mt-1">
              {services.length} total
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'services', 'bookings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium capitalize transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-violet-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-600" />
                Recent Bookings
              </h3>
              <div className="space-y-3">
                {bookings.slice(0, 4).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div>
                      <p className="font-medium">{booking.customer?.fullName}</p>
                      <p className="text-xs text-gray-500">{formatDate(booking.scheduledDate)} at {booking.scheduledTime?.start}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('bookings')}
                className="w-full mt-4 py-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
              >
                View All Bookings →
              </button>
            </div>

            {/* My Services */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-violet-600" />
                My Services
              </h3>
              <div className="space-y-3">
                {services.slice(0, 3).map((service) => (
                  <div key={service._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(service.category)}</span>
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-xs text-gray-500">₹{service.pricePerHour}/hr • {service.totalBookings} bookings</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('services')}
                className="w-full mt-4 py-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
              >
                Manage Services →
              </button>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {services.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-xl text-gray-500 font-medium">No services yet</p>
                <p className="text-gray-400 mt-2">Create your first service to start receiving bookings!</p>
                <button
                  onClick={() => setShowNewServiceModal(true)}
                  className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Service
                </button>
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-2xl">
                        {getCategoryIcon(service.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{service.title}</h3>
                          {service.isVerified && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-violet-600 font-bold">₹{service.pricePerHour}/hr</span>
                          <span className="flex items-center gap-1 text-amber-500 text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            {service.rating?.toFixed(1)} ({service.totalReviews})
                          </span>
                          <span className="text-sm text-gray-500">{service.totalBookings} bookings</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleService(service._id)}
                        className={`p-2 rounded-lg transition ${
                          service.isActive
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        title={service.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {service.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      <Link
                        href={`/skills/provider/${service._id}`}
                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition"
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className={`flex items-center gap-2 text-sm ${service.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {service.isActive ? 'Active - Accepting bookings' : 'Inactive - Not visible'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-xl text-gray-500 font-medium">No bookings yet</p>
                <p className="text-gray-400 mt-2">When customers book your services, they&apos;ll appear here.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{booking.customer?.fullName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{booking.service?.title}</p>
                    </div>
                    <p className="text-xl font-bold text-violet-600">₹{booking.totalAmount}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-violet-600" />
                      {formatDate(booking.scheduledDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-violet-600" />
                      {booking.scheduledTime?.start} - {booking.scheduledTime?.end}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 text-violet-600" />
                      {booking.customer?.phone}
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                    <span>
                      {booking.customerAddress?.street}, {booking.customerAddress?.city} - {booking.customerAddress?.pincode}
                    </span>
                  </div>

                  {booking.description && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                      <p className="text-gray-600 dark:text-gray-400">{booking.description}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition text-sm"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Start Work
                        </button>
                        <a
                          href={`tel:${booking.customer?.phone}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          Call Customer
                        </a>
                      </>
                    )}
                    {booking.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Completed
                      </button>
                    )}
                    {booking.status === 'completed' && (
                      <span className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Service Modal */}
      {showNewServiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-xl mb-6">Add New Service</h3>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Title *</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  required
                  placeholder="e.g., Expert Electrician Service"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe your service..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price per Hour (₹) *</label>
                  <input
                    type="number"
                    value={newService.pricePerHour}
                    onChange={(e) => setNewService({ ...newService, pricePerHour: e.target.value })}
                    required
                    min="0"
                    placeholder="300"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={newService.experience}
                    onChange={(e) => setNewService({ ...newService, experience: e.target.value })}
                    min="0"
                    placeholder="5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newService.skills}
                  onChange={(e) => setNewService({ ...newService, skills: e.target.value })}
                  placeholder="Wiring, Repairs, Installation"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Service Radius (km)</label>
                <input
                  type="number"
                  value={newService.serviceRadius}
                  onChange={(e) => setNewService({ ...newService, serviceRadius: Number(e.target.value) })}
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewServiceModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl transition font-medium flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Service'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

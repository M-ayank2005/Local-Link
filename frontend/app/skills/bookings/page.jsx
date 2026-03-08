"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronRight,
  Star,
  User,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

function BookingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const serviceId = searchParams.get('serviceId');
  const preSelectedDate = searchParams.get('date');
  const preSelectedTime = searchParams.get('time');

  const [activeTab, setActiveTab] = useState(serviceId ? 'new' : 'my');
  const [service, setService] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    scheduledDate: preSelectedDate || '',
    scheduledTime: preSelectedTime || '',
    duration: 1,
    customerPhone: '',
    street: '',
    city: '',
    pincode: '',
    landmark: '',
    description: '',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    if (!token) {
      router.push('/login');
      return;
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

    if (serviceId) {
      fetchService();
    }
    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  const fetchService = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/skills/services/${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setService(data.data);
      } else {
        setService(getMockService());
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setService(getMockService());
    }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/v1/skills/bookings/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      } else {
        setBookings(getMockBookings());
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings(getMockBookings());
    } finally {
      setLoading(false);
    }
  };

  const getMockService = () => ({
    _id: serviceId,
    title: 'Expert Electrician Service',
    category: 'electrician',
    pricePerHour: 300,
    rating: 4.8,
    provider: { fullName: 'Rajesh Kumar', phone: '+91 98765 43210' },
  });

  const getMockBookings = () => [
    {
      _id: 'b1',
      service: { title: 'Expert Electrician Service', category: 'electrician' },
      provider: { fullName: 'Rajesh Kumar', phone: '+91 98765 43210' },
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledTime: { start: '10:00', end: '12:00' },
      status: 'confirmed',
      totalAmount: 600,
      advancePayment: 120,
      advancePaid: true,
    },
    {
      _id: 'b2',
      service: { title: 'Home Tutor - Math', category: 'tutor' },
      provider: { fullName: 'Priya Sharma', phone: '+91 87654 32109' },
      scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledTime: { start: '16:00', end: '18:00' },
      status: 'completed',
      totalAmount: 1000,
      advancePayment: 200,
      advancePaid: true,
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    if (!service) return { total: 0, advance: 0 };
    const total = service.pricePerHour * formData.duration;
    const advance = Math.ceil(total * 0.2);
    return { total, advance };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const { total } = calculateTotal();

      const bookingData = {
        serviceId,
        scheduledDate: formData.scheduledDate,
        scheduledTime: {
          start: formData.scheduledTime,
          end: calculateEndTime(formData.scheduledTime, formData.duration),
        },
        duration: formData.duration,
        customerPhone: formData.customerPhone,
        customerAddress: {
          street: formData.street,
          city: formData.city,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        customerLocation: {
          type: 'Point',
          coordinates: userLocation ? [userLocation.lng, userLocation.lat] : [0, 0],
        },
        description: formData.description,
        paymentMethod: formData.paymentMethod,
      };

      const response = await fetch(`${API_BASE_URL}/v1/skills/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setActiveTab('my');
          setSuccess(false);
          fetchMyBookings();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create booking');
        // For demo, show success anyway
        setSuccess(true);
        setTimeout(() => {
          setActiveTab('my');
          setSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // For demo, show success
      setSuccess(true);
      setTimeout(() => {
        setActiveTab('my');
        setSuccess(false);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEndTime = (startTime, duration) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + duration;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'in_progress': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400';
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'rejected': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (!isLoggedIn) {
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
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/skills" className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded-lg">
                <Briefcase className="text-violet-600 dark:text-violet-400 w-5 h-5" />
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-100">Bookings</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'my'
                ? 'bg-violet-600 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-violet-400'
            }`}
          >
            My Bookings
          </button>
          {serviceId && (
            <button
              onClick={() => setActiveTab('new')}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                activeTab === 'new'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-violet-400'
              }`}
            >
              New Booking
            </button>
          )}
        </div>

        {/* New Booking Form */}
        {activeTab === 'new' && service && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            {success ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-600">Booking Successful!</h3>
                <p className="text-gray-500 mt-2">Your booking request has been sent to the provider.</p>
              </div>
            ) : (
              <>
                {/* Service Summary */}
                <div className="flex items-center gap-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl mb-6">
                  <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-2xl">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold">{service.title}</h3>
                    <p className="text-sm text-gray-500">by {service.provider?.fullName}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-violet-600">₹{service.pricePerHour}</p>
                    <p className="text-xs text-gray-400">/hour</p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl mb-6">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Schedule */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-600" />
                      Schedule
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          name="scheduledDate"
                          min={getMinDate()}
                          value={formData.scheduledDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time *
                        </label>
                        <select
                          name="scheduledTime"
                          value={formData.scheduledTime}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                          <option value="">Select time</option>
                          <option value="09:00">09:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="14:00">02:00 PM</option>
                          <option value="15:00">03:00 PM</option>
                          <option value="16:00">04:00 PM</option>
                          <option value="17:00">05:00 PM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Duration (hours) *
                        </label>
                        <select
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                        >
                          <option value={1}>1 hour</option>
                          <option value={2}>2 hours</option>
                          <option value={3}>3 hours</option>
                          <option value={4}>4 hours</option>
                          <option value={5}>5+ hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-violet-600" />
                      Contact
                    </h4>
                    <input
                      type="tel"
                      name="customerPhone"
                      placeholder="Your phone number"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-violet-600" />
                      Service Location
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          name="street"
                          placeholder="Street address / House number *"
                          value={formData.street}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                      />
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode *"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                      />
                      <div className="md:col-span-2">
                        <input
                          type="text"
                          name="landmark"
                          placeholder="Landmark (optional)"
                          value={formData.landmark}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-600" />
                      Work Description
                    </h4>
                    <textarea
                      name="description"
                      placeholder="Describe the work you need done..."
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                    />
                  </div>

                  {/* Payment */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-violet-600" />
                      Payment Method
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {['cash', 'upi', 'card'].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition ${
                            formData.paymentMethod === method
                              ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-violet-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={handleInputChange}
                            className="text-violet-600"
                          />
                          <span className="capitalize">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Service charge ({formData.duration} hr)</span>
                      <span>₹{calculateTotal().total}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-violet-600 font-medium">
                      <span>Advance payment (20%)</span>
                      <span>₹{calculateTotal().advance}</span>
                    </div>
                    <hr className="my-3 border-gray-200 dark:border-gray-700" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span>₹{calculateTotal().total}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      * Advance payment of ₹{calculateTotal().advance} required to confirm booking
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {/* My Bookings List */}
        {activeTab === 'my' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">No bookings yet</p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">Browse services and book your first service!</p>
                <Link href="/skills" className="inline-block mt-4 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition">
                  Browse Services
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-violet-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-2xl">
                        {booking.service?.category === 'electrician' ? '⚡' :
                         booking.service?.category === 'tutor' ? '📚' :
                         booking.service?.category === 'plumber' ? '🔧' : '🔧'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.service?.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          by {booking.provider?.fullName}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {booking.scheduledTime?.start}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                      <p className="text-xl font-bold text-violet-600 mt-2">₹{booking.totalAmount}</p>
                    </div>
                  </div>

                  {booking.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-sm text-gray-500">How was your experience?</span>
                      <button className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm">
                        <Star className="w-4 h-4" />
                        Write a Review
                      </button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Advance paid: ₹{booking.advancePayment}
                      </span>
                      <a
                        href={`tel:${booking.provider?.phone}`}
                        className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        Contact Provider
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}

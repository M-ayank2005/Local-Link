"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Star,
  ArrowLeft,
  Clock,
  Phone,
  Mail,
  BadgeCheck,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  Languages,
  Award,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
    fetchService();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchService = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/skills/services/${params.id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setService(data.data);
      } else {
        // Mock data for demo
        setService(getMockService());
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      setService(getMockService());
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/skills/services/${params.id}/reviews`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.data || []);
      } else {
        setReviews(getMockReviews());
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews(getMockReviews());
    } finally {
      setReviewsLoading(false);
    }
  };

  const getMockService = () => ({
    _id: params.id,
    title: 'Expert Electrician Service',
    category: 'electrician',
    description: 'Professional electrical repairs, wiring, and installations with 10+ years experience. I specialize in residential electrical work including fan installation, wiring repairs, switchboard work, and complete home electrical solutions. Available for emergency services as well.',
    pricePerHour: 300,
    pricePerVisit: 150,
    rating: 4.8,
    totalReviews: 45,
    totalBookings: 128,
    experience: 10,
    isVerified: true,
    isActive: true,
    skills: ['Wiring', 'Repairs', 'Installation', 'Maintenance', 'Emergency Services'],
    languages: ['Hindi', 'English'],
    serviceRadius: 10,
    availability: {
      monday: { isAvailable: true, slots: [{ start: '09:00', end: '18:00' }] },
      tuesday: { isAvailable: true, slots: [{ start: '09:00', end: '18:00' }] },
      wednesday: { isAvailable: true, slots: [{ start: '09:00', end: '18:00' }] },
      thursday: { isAvailable: true, slots: [{ start: '09:00', end: '18:00' }] },
      friday: { isAvailable: true, slots: [{ start: '09:00', end: '18:00' }] },
      saturday: { isAvailable: true, slots: [{ start: '10:00', end: '16:00' }] },
      sunday: { isAvailable: false, slots: [] },
    },
    address: {
      street: 'Block A, Sector 15',
      city: 'Noida',
      state: 'UP',
      pincode: '201301',
    },
    provider: {
      _id: 'p1',
      fullName: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 98765 43210',
      profileImage: '',
      rating: 4.8,
      totalReviews: 45,
      isVerified: true,
      createdAt: '2023-01-15',
    },
  });

  const getMockReviews = () => [
    {
      _id: 'r1',
      rating: 5,
      title: 'Excellent service!',
      comment: 'Very professional and completed the work quickly. Fixed all electrical issues in my house. Highly recommended!',
      reviewer: { fullName: 'Amit Patel', profileImage: '' },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      helpfulCount: 12,
      response: null,
    },
    {
      _id: 'r2',
      rating: 4,
      title: 'Good work',
      comment: 'Did a great job with the wiring. Arrived on time and was very courteous. Pricing was fair.',
      reviewer: { fullName: 'Sneha Gupta', profileImage: '' },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      helpfulCount: 8,
      response: {
        text: 'Thank you for your kind review! Looking forward to serving you again.',
        respondedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      _id: 'r3',
      rating: 5,
      title: 'Emergency service was fantastic',
      comment: 'Called late evening for an emergency and he came within 30 minutes. Fixed the issue professionally. True professional!',
      reviewer: { fullName: 'Rahul Verma', profileImage: '' },
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      helpfulCount: 15,
      response: null,
    },
  ];

  const handleBooking = () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    router.push(`/skills/bookings?serviceId=${service._id}&date=${selectedDate}&time=${selectedTime}`);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-xl text-gray-500">Service not found</p>
        <Link href="/skills" className="mt-4 text-violet-600 hover:underline">
          ← Back to services
        </Link>
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
              <span className="font-bold text-gray-800 dark:text-gray-100">Service Details</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-start gap-4">
                <div className="p-4 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-3xl">
                  ⚡
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{service.title}</h1>
                    {service.isVerified && (
                      <BadgeCheck className="w-6 h-6 text-violet-600" />
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">
                    {service.category} • {service.experience} years experience
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg font-semibold">
                      <Star className="w-5 h-5 fill-current" />
                      {service.rating?.toFixed(1)}
                      <span className="text-gray-400 font-normal text-sm">({service.totalReviews} reviews)</span>
                    </span>
                    <span className="text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm">
                      {service.totalBookings}+ bookings
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm">
                      <MapPin className="w-4 h-4" />
                      Serves {service.serviceRadius}km radius
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold mb-3">About this service</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Skills */}
              {service.skills?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-3">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {service.languages?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Availability
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DAYS.map((day) => {
                    const dayData = service.availability?.[day];
                    return (
                      <div
                        key={day}
                        className={`p-3 rounded-lg text-center ${
                          dayData?.isAvailable
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        }`}
                      >
                        <p className="font-medium capitalize text-sm">{day.slice(0, 3)}</p>
                        {dayData?.isAvailable && dayData.slots?.[0] && (
                          <p className="text-xs mt-1">
                            {dayData.slots[0].start} - {dayData.slots[0].end}
                          </p>
                        )}
                        {!dayData?.isAvailable && (
                          <p className="text-xs mt-1">Closed</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                About the Provider
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-2xl">
                  {service.provider?.profileImage ? (
                    <img
                      src={service.provider.profileImage}
                      alt={service.provider.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{service.provider?.fullName}</h4>
                    {service.provider?.isVerified && (
                      <BadgeCheck className="w-5 h-5 text-violet-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {formatDate(service.provider?.createdAt || new Date())}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{service.provider?.rating?.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({service.provider?.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  {service.address?.street}, {service.address?.city}, {service.address?.state} - {service.address?.pincode}
                </p>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Reviews ({reviews.length})
                </h3>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                    <div
                      key={review._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <p className="font-medium">{review.reviewer?.fullName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'text-amber-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="flex items-center gap-1 text-gray-400 hover:text-violet-600 text-sm">
                          <ThumbsUp className="w-4 h-4" />
                          {review.helpfulCount}
                        </button>
                      </div>

                      {review.title && (
                        <p className="font-medium mt-3">{review.title}</p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                        {review.comment}
                      </p>

                      {review.response && (
                        <div className="mt-3 ml-4 pl-4 border-l-2 border-violet-200 dark:border-violet-800">
                          <p className="text-sm font-medium text-violet-600">Provider's Response</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {review.response.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {reviews.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full py-3 text-violet-600 hover:text-violet-700 font-medium flex items-center justify-center gap-2"
                    >
                      {showAllReviews ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show All Reviews ({reviews.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 sticky top-24">
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-violet-600">₹{service.pricePerHour}</span>
                  <span className="text-gray-400">/hour</span>
                </div>
                {service.pricePerVisit && (
                  <p className="text-sm text-gray-500 mt-1">
                    or ₹{service.pricePerVisit} per visit
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 outline-none"
                  >
                    <option value="">Select time slot</option>
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

                <button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </button>

                <p className="text-xs text-gray-500 text-center">
                  20% advance payment required for confirmation
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 text-violet-600" />
                    <span>Contact after booking</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-violet-600" />
                    <span>Usually responds within 1 hour</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Award className="w-4 h-4 text-violet-600" />
                    <span>Satisfaction guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Booking {
  id: string;
  hotel_name?: string;
  guide_first_name?: string;
  guide_last_name?: string;
  guide_email?: string;
  guide_phone?: string;
  check_in_date?: string;
  start_date?: string;
  check_out_date?: string;
  end_date?: string;
  number_of_rooms?: number;
  number_of_guests?: number;
  number_of_people?: number;
  totalPrice?: number;
  total_amount?: number;
  total_price?: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  notes?: string;
  special_requests?: string;
  type?: 'hotel' | 'guide';
  price_per_night?: number;
  daily_rate?: number;
  createdAt?: string;
  created_at?: string;
  confirmation_code?: string;
  location?: string;
  city?: string;
  address?: string;
  description?: string;
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const bookingId = params.id as string;

  useEffect(() => {
    if (!user || user.role !== 'tourist') {
      router.push('/login');
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from hotels first
        let res: any = await api.get(`/api/hotels/bookings/${bookingId}`).catch(() => null);
        
        // If not found, try guides
        if (!res || !res.success) {
          res = await api.get(`/api/guides/bookings/${bookingId}`).catch(() => null);
        }

        if (res && res.success && res.booking) {
          const b = res.booking;
          setBooking({
            ...b,
            type: b.guide_first_name ? 'guide' : 'hotel',
          });
        } else {
          setError('Booking not found');
        }
      } catch (err: any) {
        console.error('Failed to fetch booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [user, router, bookingId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(booking?.check_in_date || booking?.start_date || '');
    const checkOut = new Date(booking?.check_out_date || booking?.end_date || '');
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Bookings
          </button>
          
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">{error || 'Booking not found'}</p>
            <button
              onClick={() => router.push('/bookings/my-bookings')}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 mt-4"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Bookings
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {booking.type === 'hotel' ? booking.hotel_name : `${booking.guide_first_name} ${booking.guide_last_name}`}
              </h1>
              <p className="text-gray-600 mt-2">
                {booking.type === 'hotel' ? 'Hotel Booking' : 'Tour Booking'} • Confirmation Code: <span className="font-mono font-semibold">{booking.confirmation_code || booking.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg border-2 ${getStatusColor(booking.status)}`}>
              {getStatusIcon(booking.status)}
              <span className="text-xl font-bold capitalize">{booking.status}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Check-in Date */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Check-in Date</span>
                  </div>
                  <p className="text-lg text-gray-900 font-semibold">
                    {new Date(booking.check_in_date || booking.start_date || '').toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Check-out Date */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">Check-out Date</span>
                  </div>
                  <p className="text-lg text-gray-900 font-semibold">
                    {new Date(booking.check_out_date || booking.end_date || '').toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Number of Nights (for hotels) */}
                {booking.type === 'hotel' && (
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Number of Nights</span>
                    </div>
                    <p className="text-lg text-gray-900 font-semibold">
                      {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                    </p>
                  </div>
                )}

                {/* Rooms/Guests */}
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">
                      {booking.type === 'hotel' ? 'Number of Rooms' : 'Number of Guests'}
                    </span>
                  </div>
                  <p className="text-lg text-gray-900 font-semibold">
                    {booking.number_of_rooms || booking.number_of_people || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location & Contact Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {booking.type === 'hotel' ? 'Hotel' : 'Guide'} Information
              </h2>
              
              <div className="space-y-4">
                {/* Location (for hotels) */}
                {booking.type === 'hotel' && booking.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Location</p>
                      <p className="text-gray-900">{booking.location || booking.city || 'N/A'}</p>
                    </div>
                  </div>
                )}

                {/* Contact - Phone (for guides) */}
                {booking.type === 'guide' && booking.guide_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Phone</p>
                      <a href={`tel:${booking.guide_phone}`} className="text-teal-600 hover:text-teal-700">
                        {booking.guide_phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {booking.guide_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Email</p>
                      <a href={`mailto:${booking.guide_email}`} className="text-teal-600 hover:text-teal-700">
                        {booking.guide_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests / Notes */}
            {(booking.notes || booking.special_requests || booking.description) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Notes & Requests</h2>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-900">
                    {booking.notes || booking.special_requests || booking.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Price & Status */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Price Summary</h3>
              
              <div className="space-y-3 mb-4 border-b pb-4">
                {booking.type === 'hotel' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per night</span>
                      <span className="font-semibold">₹{(booking.price_per_night || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of nights</span>
                      <span className="font-semibold">{calculateNights()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{((booking.price_per_night || 0) * calculateNights()).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold text-teal-600">
                  ₹{(booking.total_amount || booking.total_price || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Status</h3>
              
              {booking.status === 'pending' && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    ⏳ Waiting for {booking.type === 'hotel' ? 'hotel' : 'guide'} confirmation.
                  </p>
                  <p className="text-xs text-yellow-700 mt-2">
                    You will receive an email notification once confirmed.
                  </p>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✅ Booking confirmed!
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    {booking.type === 'guide' 
                      ? 'You can contact the guide to coordinate details about your tour.'
                      : 'Your hotel reservation is confirmed. Check your email for booking confirmation.'}
                  </p>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    ✅ Booking completed!
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    Thank you for using our service. We hope you had a great experience!
                  </p>
                </div>
              )}

              {(booking.status === 'rejected' || booking.status === 'cancelled') && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">
                    ❌ {booking.status === 'rejected' ? 'Booking declined' : 'Booking cancelled'}
                  </p>
                  <p className="text-xs text-red-700 mt-2">
                    {booking.status === 'rejected' 
                      ? `The ${booking.type === 'hotel' ? 'hotel' : 'guide'} declined this booking request.`
                      : 'This booking has been cancelled.'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-2">
                {booking.type === 'guide' && booking.status === 'confirmed' && (
                  <button
                    onClick={() => router.push(`/messages`)}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition"
                  >
                    Message Guide
                  </button>
                )}
                
                <button
                  onClick={() => window.print()}
                  className="w-full px-4 py-2 border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-semibold transition"
                >
                  Print Details
                </button>

                <button
                  onClick={() => router.push('/bookings/my-bookings')}
                  className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Back to Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Calendar, Users, MapPin, DollarSign, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  hotel_name?: string;
  guide_first_name?: string;
  guide_last_name?: string
  check_in_date?: string;
  start_date?: string;
  check_out_date?: string;
  end_date?: string;
  number_of_rooms?: number;
  number_of_guests?: number;
  number_of_people?: number;
  totalPrice?: number;
  total_amount?: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  notes?: string;
  type?: 'hotel' | 'guide';
  price_per_night?: number;
  daily_rate?: number;
  createdAt?: string;
  created_at?: string;
  total_price?: number;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'completed'>('all');

  useEffect(() => {
    if (!user || user.role !== 'tourist') {
      router.push('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        // Get hotel bookings
        const hotelRes: any = await api.get('/api/hotels/user/my-bookings');
        const hotelBookings = (hotelRes.bookings || []).map((b: any) => ({
          ...b,
          type: 'hotel',
          guideName: b.hotelName,
          start_date: b.checkInDate,
          end_date: b.checkOutDate,
          number_of_people: b.numberOfGuests,
          daily_rate: b.price_per_night,
        }));

        // Get guide bookings
        const guideRes: any = await api.get('/api/guides/user/my-bookings');
        const guideBookings = (guideRes.bookings || []).map((b: any) => ({
          ...b,
          type: 'guide',
        }));

        const allBookings = [...hotelBookings, ...guideBookings].sort(
          (a, b) => 
            new Date(b.created_at || b.createdAt || 0).getTime() - 
            new Date(a.created_at || a.createdAt || 0).getTime()
        );

        setBookings(allBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, router]);

  // ✅ Filter bookings
  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  // ✅ Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track and manage all your hotel and tour bookings</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['all', 'pending', 'confirmed', 'completed', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No bookings found</p>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start booking hotels and tours to see them here'
                : `No ${filter} bookings yet`}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Browse Guides & Hotels
            </button>
          </div>
        ) : (
          // ✅ Bookings Grid
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Header - Status */}
                <div className={`px-6 py-4 flex justify-between items-start ${
                  booking.status === 'pending' ? 'bg-yellow-50' :
                  booking.status === 'confirmed' ? 'bg-green-50' :
                  booking.status === 'rejected' ? 'bg-red-50' :
                  booking.status === 'completed' ? 'bg-blue-50' :
                  'bg-gray-50'
                }`}>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {booking.type === 'hotel' ? booking.hotel_name : booking.guide_first_name + ' ' + booking.guide_last_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {booking.type === 'hotel' ? 'Hotel Booking' : 'Tour Booking'} • {new Date(booking.created_at || booking.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(booking.status)}`}>
                    {getStatusIcon(booking.status)}
                    <span className="font-semibold capitalize">{booking.status}</span>
                  </div>
                </div>

                {/* Card Body - Details */}
                <div className="px-6 py-4 border-t">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Dates */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold">Check-in</span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {booking.check_in_date || booking.start_date
                          ? new Date(booking.check_in_date || booking.start_date || '').toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold">Check-out</span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {booking.check_out_date || booking.end_date
                          ? new Date(booking.check_out_date || booking.end_date || '').toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Guests/Rooms */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {booking.type === 'hotel' ? 'Rooms' : 'Guests'}
                        </span>
                      </div>
                      <p className="text-gray-900 font-semibold">
                        {booking.number_of_rooms || booking.number_of_people || 0}
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-semibold">Total Price</span>
                      </div>
                      <p className="text-teal-600 font-bold text-lg">
                        ₹{( booking.total_amount || booking.total_price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Notes</p>
                      <p className="text-blue-800">{booking.notes}</p>
                    </div>
                  )}

                  {/* Status Messages */}
                  {booking.status === 'pending' && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        ⏳ Waiting for {booking.type === 'hotel' ? 'hotel' : 'guide'} confirmation
                      </p>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800">
                        ✅ Booking confirmed! {booking.type === 'guide' && 'You can message the guide to coordinate details.'}
                      </p>
                    </div>
                  )}

                  {booking.status === 'rejected' && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-800">
                        ❌ Booking was declined. Please try another {booking.type === 'hotel' ? 'hotel' : 'guide'}.
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer - Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                  {booking.type === 'guide' && booking.status === 'confirmed' && (
                    <button
                      onClick={() => router.push(`/messages?user=${booking.id}`)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold transition"
                    >
                      Message {booking.guide_first_name}
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 font-semibold transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

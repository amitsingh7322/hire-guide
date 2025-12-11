'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/ToastContext';
import { Settings, Plus, Trash2, Edit, Users, DollarSign, Calendar, Home } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  price_per_night: number;
  available_rooms: number;
  total_rooms: number;
  property_type: string;
  amenities: string[];
}

interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export default function HotelDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

const fetchData = async () => {
  try {
    setLoading(true);

    // Fetch hotel profile
    const hotelRes = await api.get('/api/hotels/profile/me');
    if (hotelRes.hotel) {
      setHotel(hotelRes.hotel);

      // ✅ FIXED: Use hotel ID from response to fetch bookings
      const bookingsRes = await api.get(`/api/hotels/${hotelRes.hotel.id}/bookings`);
      
      if (bookingsRes.bookings) {
        console.log('Raw bookings data:', bookingsRes.bookings);
          // Ensure bookingsRes.bookings is always an array
          const bookings = Array.isArray(bookingsRes.bookings)
          ? bookingsRes.bookings
          : [bookingsRes.bookings];
        // ✅ FIXED: Map backend field names to expected format
        const mappedBookings = bookings.map((b: any) => ({
          id: b.id,
          guestName: `${b.guest_first_name} ${b.guest_last_name}`,
          checkInDate: b.check_in_date,
          checkOutDate: b.check_out_date,
          numberOfRooms: b.number_of_rooms,
          totalPrice: b.total_amount,
          status: b.status,
        }));

        setBookings(mappedBookings);

        // Calculate stats
        const totalBookings = mappedBookings.length;
        const totalRevenue = mappedBookings.reduce(
          (sum: number, b: Booking) => sum + (b.totalPrice || 0),
          0
        );
        const confirmedBookings = mappedBookings.filter(
          (b: Booking) => b.status === 'confirmed'
        ).length;
        const pendingRequests = mappedBookings.filter(
          (b: Booking) => b.status === 'pending'
        ).length;

        setStats({
          totalBookings,
          totalRevenue,
          occupancyRate: hotelRes.hotel?.totalRooms
            ? Math.round((confirmedBookings / hotelRes.hotel.totalRooms) * 100)
            : 0,
          pendingRequests,
        });
      }
    }
  } catch (err: any) {
    toastError(err?.message || 'Failed to load dashboard');
  } finally {
    setLoading(false);
  }
};


    fetchData();
  }, [authLoading, user, router]);


  const handleDeleteHotel = async () => {
  if (!hotel) return;
  try {
   await api.delete(`/api/hotels/${hotel.id}`);
    toastSuccess('Hotel deleted successfully');
    router.push('/');
  } catch (err: any) {
    toastError(err?.message || 'Failed to delete hotel');
  }
};

// ✅ AFTER - CORRECT ENDPOINT
const handleUpdateBookingStatus = async (
  bookingId: string,
  status: 'confirmed' | 'cancelled'
) => {
  try {
    if (!hotel) return;
    
    // ✅ Use correct endpoint: /hotels/:hotelId/bookings/:bookingId
    await api.put(`/api/hotels/${hotel.id}/bookings/${bookingId}`, { status });
    
    toastSuccess(`Booking ${status} successfully`);

    // Refresh bookings - also use correct endpoint
    const bookingsRes = await api.get(`/api/hotels/${hotel.id}/bookings`);
    if (bookingsRes.bookings) {
      console.log('Raw bookingsdcnksdnc data:', bookingsRes.bookings);
          // Ensure bookingsRes.bookings is always an array
          const bookings = Array.isArray(bookingsRes.bookings)
          ? bookingsRes.bookings
          : [bookingsRes.bookings];
      const mappedBookings = bookings.map((b: any) => ({
        id: b.id,
        guestName: `${b.guest_first_name} ${b.guest_last_name}`,
        checkInDate: b.check_in_date,
        checkOutDate: b.check_out_date,
        numberOfRooms: b.number_of_rooms,
        totalPrice: b.total_amount,
        status: b.status,
      }));
      setBookings(mappedBookings);
    }
  } catch (err: any) {
    toastError(err?.message || 'Failed to update booking');
  }
};


  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">No hotel profile found</p>
          <Link
            href="/hotels/complete-profile"
            className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Create Hotel Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-600">{hotel.city}, {hotel.property_type}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/hotels/edit-profile"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={handleDeleteHotel}
              title="Delete Hotel?"
              message="Are you sure you want to delete this hotel? This action cannot be undone."
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              </div>
              <Home className="w-8 h-8 text-teal-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Hotel Details</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Description</p>
              <p className="text-gray-900">{hotel.description}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Property Type</p>
              <p className="text-gray-900 capitalize">{hotel.property_type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Price Per Night</p>
              <p className="text-gray-900 font-semibold">₹{hotel.price_per_night}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Rooms</p>
              <p className="text-gray-900">
                {hotel.available_rooms} / {hotel.total_rooms} available
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 text-sm mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities?.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Bookings</h2>
            <span className="text-sm text-gray-600">{bookings.length} total</span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No bookings yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Guest</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-in</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-out</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rooms</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.guestName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.numberOfRooms}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-800 font-semibold text-xs"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-800 font-semibold text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

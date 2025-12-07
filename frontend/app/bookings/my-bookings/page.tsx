'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'tourist') {
      router.push('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        // Hotel bookings
        const hotelRes:any = await api.get('/hotels/user/my-bookings');
        // Guide bookings
        const guideRes:any = await api.get('/tours/user/my-bookings');

        setBookings([
          ...(hotelRes.bookings || []),
          ...(guideRes.bookings || []),
        ]);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, router]);

  if (loading) return <div>Loading bookings...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No bookings yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold">{booking.hotelName || booking.guideName}</h2>
              <p>Check-in: {booking.checkInDate}</p>
              <p>Status: {booking.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

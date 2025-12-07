'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Booking {
  id: string;
  guide_id: string
  tourist_id: string;
  tourist_first_name: string;
  tourist_last_name: string;
  tourist_email: string;
  start_date: string;
  end_date: string;
  number_of_people: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/guides/bookings', {
        params: { status: filter || undefined },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBookings(res.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, guideId: string, newStatus: string) => {
    try {
        console.log('Updating booking', bookingId,"rhuir", guideId, 'to status', newStatus);
      await axios.put(
        `/api/guides/${guideId}/bookings/${bookingId}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Booking Management</h1>

      <div className="mb-6 flex gap-2">
        {['', 'pending', 'confirmed', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {status || 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-4 text-left">Tourist</th>
              <th className="border p-4 text-left">Check-in</th>
              <th className="border p-4 text-left">Check-out</th>
              <th className="border p-4 text-center">People</th>
              <th className="border p-4 text-right">Price</th>
              <th className="border p-4 text-center">Status</th>
              <th className="border p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="border p-4">
                  <div>
                    <p className="font-bold">
                      {booking.tourist_first_name} {booking.tourist_last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.tourist_email}
                    </p>
                  </div>
                </td>
                <td className="border p-4">
                  {new Date(booking.start_date).toLocaleDateString()}
                </td>
                <td className="border p-4">
                  {new Date(booking.end_date).toLocaleDateString()}
                </td>
                <td className="border p-4 text-center">{booking.number_of_people}</td>
                <td className="border p-4 text-right font-bold">
                  ₹{booking.total_price}
                </td>
                <td className="border p-4 text-center">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="border p-4 text-center">
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleStatusChange(booking.id, booking.guide_id, 'confirmed')}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(booking.id, booking.guide_id, 'rejected')}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusChange(booking.id, booking.guide_id, 'completed')}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

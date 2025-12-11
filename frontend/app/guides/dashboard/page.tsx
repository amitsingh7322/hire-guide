'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/ToastContext';
import { Edit, Trash2, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Guide {
  id: string;
  bio: string;
  city: string;
  daily_rate: number;
  hourly_rate: number;
  experience_years: number;
  specialties: string[];
  languages: string[];
  certifications: string[];
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    pendingRequests: number;
    totalRevenue: number;
    upcomingBookings: number;
  };
}

interface Booking {
  id: string;
  tourist_first_name: string;
  tourist_last_name: string;
  tourist_email: string;
  start_date: string;
  end_date: string;
  number_of_people: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  notes: string;
}

export default function GuideDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/guides/dashboard');
        console.log("Dashboard response:", response);
        if (response.success && response.guide)
          console.log("Dashboard data:", response); {
          setGuide(response.guide);
          setBookings(response.bookings || []);
        }
      } catch (err: any) {
        toastError(err?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [authLoading, user, router]);

  const handleDeleteProfile = async () => {
    if (!guide) return;
    try {
      await api.delete(`/api/guides/${guide.id}`);
      toastSuccess('Profile deleted successfully');
      router.push('/');
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete profile');
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: 'confirmed' | 'rejected'
  ) => {
    try {
      await api.put(`/api/guides/bookings/${bookingId}`, { status });
      toastSuccess(`Booking ${status} successfully`);

      // Refresh bookings
      const response = await api.get('/api/guides/dashboard');
      if (response.bookings) {
        setBookings(response.bookings);
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

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">No guide profile found</p>
          <Link
            href="/guides/complete-profile"
            className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Create Guide Profile
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
            <h1 className="text-3xl font-bold text-gray-900">Guide Dashboard</h1>
            <p className="text-gray-600">{guide.city} • {guide.experience_years} years experience</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/guides/edit-profile"
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
              onConfirm={handleDeleteProfile}
              title="Delete Profile?"
              message="Are you sure you want to delete your profile?"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{guide.stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed</p>
                <p className="text-3xl font-bold text-green-600">{guide.stats.confirmedBookings}</p>
              </div>
              <Users className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{guide.stats.pendingRequests}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-teal-600">₹{guide.stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-purple-600">{guide.stats.upcomingBookings}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm">Bio</p>
              <p className="text-gray-900">{guide.bio}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Location</p>
              <p className="text-gray-900">{guide.city}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Daily Rate</p>
              <p className="text-gray-900 font-semibold">₹{guide.daily_rate}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Hourly Rate</p>
              <p className="text-gray-900 font-semibold">₹{guide.hourly_rate}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 text-sm mb-2">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {guide.specialties?.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 text-sm mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {guide.languages?.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {lang}
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tourist</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">People</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.tourist_first_name} {booking.tourist_last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(booking.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{booking.number_of_people}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ₹{booking.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : booking.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
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
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')}
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

'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { X } from 'lucide-react';
import { toastError, toastSuccess } from '@/lib/ToastContext';

interface HotelBookingModalProps {
  hotelId: string;
  hotelName: string;
  pricePerNight: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HotelBookingModal({
  hotelId,
  hotelName,
  pricePerNight,
  onClose,
  onSuccess,
}: HotelBookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 1,
    numberOfGuests: 1,
    notes: '',
  });

  const calculateTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * pricePerNight * formData.numberOfRooms : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ FIXED: Use correct endpoint that matches your backend route
      // Backend: POST /hotels/:id/book
      const endpoint = `/api/hotels/${hotelId}/book`;

      await api.post(endpoint, {
        checkInDate: formData.checkInDate,    // ✅ Backend expects camelCase
        checkOutDate: formData.checkOutDate,
        numberOfRooms: formData.numberOfRooms,
        numberOfGuests: formData.numberOfGuests,
        totalPrice: calculateTotal(),
        totalNights: nights,
        notes: formData.notes,
      });

      toastSuccess('Booking created successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Booking error:', err);
      toastError(err?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();
  const nights = formData.checkInDate && formData.checkOutDate
    ? Math.ceil(
        (new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Book {hotelName}</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 rounded transition"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Date
            </label>
            <input
              type="date"
              required
              value={formData.checkInDate}
              onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out Date
            </label>
            <input
              type="date"
              required
              value={formData.checkOutDate}
              onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Number of Rooms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Rooms
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.numberOfRooms}
              onChange={e => setFormData({ ...formData, numberOfRooms: parseInt(e.target.value) || 1 })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Number of Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.numberOfGuests}
              onChange={e => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:border-teal-500"
              rows={3}
              placeholder="Twin beds, late check-in, etc..."
            />
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Price per night:</span>
              <span className="font-semibold text-gray-900">
                ₹{pricePerNight.toLocaleString('en-IN')}
              </span>
            </div>
            
            {nights > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-semibold text-gray-900">{nights}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rooms:</span>
                  <span className="font-semibold text-gray-900">{formData.numberOfRooms}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Price:</span>
                  <span className="text-lg font-bold text-teal-600">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.checkInDate || !formData.checkOutDate}
            className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Booking...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </button>

          {/* Trust Message */}
          <p className="text-center text-xs text-gray-500">
            ✓ Free cancellation up to 24 hours before check-in
          </p>
        </form>
      </div>
    </div>
  );
}

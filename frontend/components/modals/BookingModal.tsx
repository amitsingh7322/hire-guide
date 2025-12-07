'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { X } from 'lucide-react';
import { toastError } from '@/lib/ToastContext';

interface BookingModalProps {
  guideId: string;
  guideName: string;
  dailyRate: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingModal({
  guideId,
  guideName,
  dailyRate,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    number_of_people: 1,
    notes: '',
  });

  const calculateTotal = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * dailyRate : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/api/bookings', {
        guide_id: guideId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        number_of_people: formData.number_of_people,
        total_price: calculateTotal(),
        notes: formData.notes,
      });

      onSuccess();
    } catch (err: any) {
      toastError(err?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Book {guideName}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Number of People</label>
            <input
              type="number"
              min="1"
              required
              value={formData.number_of_people}
              onChange={e => setFormData({ ...formData, number_of_people: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Special Requests</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Any special requests..."
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded mb-4">
            <div className="flex justify-between mb-2">
              <span>Rate per day:</span>
              <span className="font-semibold">₹{dailyRate}</span>
            </div>
            {total > 0 && (
              <div className="flex justify-between text-lg font-bold text-teal-600">
                <span>Total:</span>
                <span>₹{total}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

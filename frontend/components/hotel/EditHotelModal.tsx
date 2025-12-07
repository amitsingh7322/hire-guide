'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { X } from 'lucide-react';
import { toastError, toastSuccess } from '@/lib/ToastContext';

interface EditHotelModalProps {
  hotelId: string;
  initialData: any;
  onClose: () => void;
  onSave: () => void;
}

export default function EditHotelModal({
  hotelId,
  initialData,
  onClose,
  onSave,
}: EditHotelModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    price_per_night: initialData?.price_per_night || 0,
    rooms_available: initialData?.rooms_available || 0,
    amenities: initialData?.amenities?.join(', ') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        price_per_night: parseFloat(formData.price_per_night.toString()),
        rooms_available: parseInt(formData.rooms_available.toString()),
        amenities: formData.amenities
          .split(',')
          .map((a: string) => a.trim())
          .filter((a: any) => a),
      };

      await api.put(`/hotels/${hotelId}`, dataToSubmit);
      toastSuccess('Hotel information updated successfully!');
      onSave();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update hotel information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Edit Hotel Information</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Hotel Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Hotel Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Luxury Beach Resort"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2 resize-none"
              rows={3}
              placeholder="Describe your hotel..."
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Street address"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Goa, Kerala"
              required
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-2">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Goa, Kerala"
            />
          </div>

          {/* Price Per Night */}
          <div>
            <label className="block text-sm font-medium mb-2">Price Per Night (₹)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.price_per_night}
              onChange={e => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 5000"
              required
            />
          </div>

          {/* Rooms Available */}
          <div>
            <label className="block text-sm font-medium mb-2">Rooms Available</label>
            <input
              type="number"
              min="0"
              value={formData.rooms_available}
              onChange={e => setFormData({ ...formData, rooms_available: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 50"
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium mb-2">Amenities (comma-separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={e => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., WiFi, Pool, Spa, Restaurant, AC"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple amenities with commas</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

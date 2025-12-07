'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { X } from 'lucide-react';
import { toastError, toastSuccess } from '@/lib/ToastContext';

interface EditGuideModalProps {
  guideId: string;
  initialData: any;
  onClose: () => void;
  onSave: () => void;
}

export default function EditGuideModal({
  guideId,
  initialData,
  onClose,
  onSave,
}: EditGuideModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: initialData?.bio || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    pin_code: initialData?.pin_code || '',
    hourly_rate: initialData?.hourly_rate || 0,
    daily_rate: initialData?.daily_rate || 0,
    experience_years: initialData?.experience_years || 0,
    languages: initialData?.languages?.join(', ') || '',
    specialties: initialData?.specialties?.join(', ') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        bio: formData.bio,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pin_code,
        hourlyRate: parseFloat(formData.hourly_rate.toString()),
        dailyRate: parseFloat(formData.daily_rate.toString()),
        experienceYears: parseInt(formData.experience_years.toString()),
        languages: formData.languages
          .split(',')
          .map((l: string) => l.trim())
          .filter((l: any) => l),
        specialties: formData.specialties
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: any) => s),
      };

      await api.put(`/guides/${guideId}/profile`, dataToSubmit);
      toastSuccess('Guide profile updated successfully!');
      onSave();
      onClose();
    } catch (err: any) {
      toastError(err?.message || 'Failed to update guide profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Edit Guide Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border rounded px-3 py-2 resize-none"
              rows={3}
              placeholder="Tell tourists about yourself..."
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
              placeholder="e.g., Delhi, Mumbai"
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
              placeholder="e.g., Delhi, Maharashtra"
            />
          </div>

          {/* Pin Code */}
          <div>
            <label className="block text-sm font-medium mb-2">Pin Code</label>
            <input
              type="text"
              value={formData.pin_code}
              onChange={e => setFormData({ ...formData, pin_code: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 110001"
            />
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">Hourly Rate (₹)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.hourly_rate}
              onChange={e => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 500"
            />
          </div>

          {/* Daily Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">Daily Rate (₹)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.daily_rate}
              onChange={e => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 2000"
            />
          </div>

          {/* Experience Years */}
          <div>
            <label className="block text-sm font-medium mb-2">Experience (Years)</label>
            <input
              type="number"
              min="0"
              max="70"
              value={formData.experience_years}
              onChange={e => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., 5"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium mb-2">Languages (comma-separated)</label>
            <input
              type="text"
              value={formData.languages}
              onChange={e => setFormData({ ...formData, languages: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., English, Hindi, French"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple languages with commas</p>
          </div>

          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium mb-2">Specialties (comma-separated)</label>
            <input
              type="text"
              value={formData.specialties}
              onChange={e => setFormData({ ...formData, specialties: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Historical Tours, Adventure, Food"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple specialties with commas</p>
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

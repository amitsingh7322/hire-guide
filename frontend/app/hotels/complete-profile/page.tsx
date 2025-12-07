    'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/ToastContext';

export default function CompleteHotelProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    latitude: '',
    longitude: '',
    propertyType: 'hotel', // hotel, resort, guest_house, apartment
    pricePerNight: '',
    amenities: [] as string[],
    totalRooms: '',
    availableRooms: '',
  });

  const amenitiesOptions = [
    'WiFi',
    'Parking',
    'Restaurant',
    'Gym',
    'Pool',
    'Spa',
    'AC',
    'Heater',
    '24/7 Front Desk',
  ];

  const propertyTypes = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'resort', label: 'Resort' },
    { value: 'guest_house', label: 'Guest House' },
    { value: 'apartment', label: 'Apartment' },
  ];

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/hotels/profile', formData);
      
      if (response.success || response.hotel) {
        toastSuccess('Hotel profile created successfully!');
        setTimeout(() => {
          router.push('/hotels/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Hotel Profile</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label className="label">Hotel Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input"
                placeholder="Luxury Hotel"
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input min-h-24"
                placeholder="Describe your hotel..."
                required
              />
            </div>

            <div>
              <label className="label">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyType: e.target.value }))}
                className="input"
                required
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label className="label">Pin Code</label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          {/* Pricing & Rooms */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pricing & Rooms</h2>
            
            <div>
              <label className="label">Price Per Night (₹)</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Total Rooms</label>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalRooms: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Available Rooms</label>
                <input
                  type="number"
                  value={formData.availableRooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableRooms: e.target.value }))}
                  className="input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Amenities</h2>
            
            <div className="grid grid-cols-2 gap-2">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="w-4 h-4"
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

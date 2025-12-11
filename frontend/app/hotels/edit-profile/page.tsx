'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/ToastContext';
import { Building, DollarSign, Home } from 'lucide-react';

export default function EditHotelProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [hotelId, setHotelId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    propertyType: 'hotel',
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

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        setFetching(true);
        const res = await api.get('/api/hotels/profile/me');
        if (res.hotel) {
          setHotelId(res.hotel.id);
          setFormData({
            name: res.hotel.name || '',
            description: res.hotel.description || '',
            address: res.hotel.address || '',
            city: res.hotel.city || '',
            state: res.hotel.state || '',
            pinCode: res.hotel.pin_code || '',
            propertyType: res.hotel.property_type || 'hotel',
            pricePerNight: res.hotel.price_per_night || '',
            amenities: res.hotel.amenities || [],
            totalRooms: res.hotel.total_rooms || '',
            availableRooms: res.hotel.available_rooms || '',
          });
        }
      } catch (err) {
        toastError('Failed to load hotel data');
      } finally {
        setFetching(false);
      }
    };

    fetchHotel();
  }, []);

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
      const response = await api.put(`/api/hotels/${hotelId}/profile`, formData);
      
      if (response.success || response.hotel) {
        toastSuccess('Profile updated successfully!');
        setTimeout(() => {
          router.push('/hotels/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-teal-600 hover:text-teal-700 font-medium mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Edit Hotel Profile</h1>
          <p className="text-gray-600 mt-2">Update your hotel information and facilities</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building className="w-5 h-5" />
              Basic Information
            </h2>
            
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
              <p className="text-sm text-gray-500 mt-1">Tell guests what makes your hotel special</p>
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
                  placeholder="Goa"
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
                  placeholder="Goa"
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
                placeholder="123 Beach Road"
              />
            </div>

            <div>
              <label className="label">Pin Code</label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                className="input"
                placeholder="403001"
              />
            </div>
          </div>

          {/* Pricing & Rooms */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing & Rooms
            </h2>
            
            <div>
              <label className="label">Price Per Night (₹)</label>
              <input
                type="number"
                value={formData.pricePerNight}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerNight: e.target.value }))}
                className="input"
                placeholder="5000"
                min="0"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Starting price per night</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Total Rooms</label>
                <input
                  type="number"
                  value={formData.totalRooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalRooms: e.target.value }))}
                  className="input"
                  placeholder="50"
                  min="0"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Total number of rooms</p>
              </div>
              <div>
                <label className="label">Available Rooms</label>
                <input
                  type="number"
                  value={formData.availableRooms}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableRooms: e.target.value }))}
                  className="input"
                  placeholder="45"
                  min="0"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Currently available</p>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Home className="w-5 h-5" />
              Amenities
            </h2>
            <p className="text-sm text-gray-600">Select all amenities your hotel offers</p>
            
            <div className="grid grid-cols-2 gap-2">
              {amenitiesOptions.map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded cursor-pointer border border-gray-200 hover:border-teal-200">
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

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/ToastContext';

export default function EditHotelProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
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

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await api.get('/api/hotels/profile/me');
        if (res.hotel) {
          setHotelId(res.hotel.id);
          setFormData({
            name: res.hotel.name || '',
            description: res.hotel.description || '',
            address: res.hotel.address || '',
            city: res.hotel.city || '',
            state: res.hotel.state || '',
            pinCode: res.hotel.pinCode || '',
            propertyType: res.hotel.propertyType || 'hotel',
            pricePerNight: res.hotel.pricePerNight || '',
            amenities: res.hotel.amenities || [],
            totalRooms: res.hotel.totalRooms || '',
            availableRooms: res.hotel.availableRooms || '',
          });
        }
      } catch (err) {
        toastError('Failed to load hotel data');
      } finally {
        setLoading(false);
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
    setFormLoading(true);

    try {
      const response = await api.put(`/api/hotels/${hotelId}/profile`, formData);
      
      if (response.success || response.hotel) {
        toastSuccess('Profile updated successfully!');
        setTimeout(() => {
          router.push('/hotel/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to update profile');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Same form structure as complete-profile page
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Hotel Profile</h1>
        {/* Form code here - same as complete-profile */}
      </div>
    </div>
  );
}

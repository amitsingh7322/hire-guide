'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ChevronLeft, Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function HotelDetailsPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await api.get(`/api/hotels/${hotelId}`);
        console.log('Hotel response:', response);
        setHotel(response?.hotel);
      } catch (err: any) {
        setError(err.message || 'Failed to load hotel');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) fetchHotel();
  }, [hotelId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (error || !hotel) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error || 'Not found'}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/hotels" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
            <ChevronLeft className="w-5 h-5" />
            Back
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {hotel.images?.[0] && (
              <div className="mb-6 rounded-lg overflow-hidden h-96 bg-gray-200">
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{hotel.city}, {hotel.state}</span>
                  </div>
                </div>
                {hotel.rating > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{Number(hotel.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-700 mb-6">{hotel.description || 'No description'}</p>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <p className="text-sm text-gray-600">Price per night</p>
              <p className="text-3xl font-bold text-teal-600 mb-6">{formatCurrency(hotel.price_per_night)}</p>
              <button className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

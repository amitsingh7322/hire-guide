'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { 
  ChevronLeft, 
  Star, 
  MapPin, 
  Trash2, 
  Edit, 
  ChevronRight,
  Wifi,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  Users,
  Wind
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { toastError, toastSuccess } from '@/lib/ToastContext';

// Modals
import HotelBookingModal from '@/components/modals/HotelBookingModal';
import EditHotelModal from '../../../components/hotel/EditHotelModal';

interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  price_per_night: number;
  images: string[];
  rating: number;
  total_reviews: number;
  amenities?: string[];
  available_rooms?: number;
  user_id?: string;
}

// Amenity icons mapping
const amenityIcons: Record<string, any> = {
  'WiFi': Wifi,
  'Restaurant': UtensilsCrossed,
  'Pool': Waves,
  'Gym': Dumbbell,
  'AC': Wind,
};

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await api.get(`/api/hotels/${hotelId}`);
        const hotelData = response?.hotel;
        setHotel(hotelData as Hotel);

        const currentUser = localStorage.getItem('userId');
        if (currentUser && hotelData?.user_id === currentUser) {
          setIsOwnProfile(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load hotel');
        toastError(err?.message || 'Failed to load hotel');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) fetchHotel();
  }, [hotelId]);

  const handleDeleteHotel = async () => {
    if (!window.confirm('Are you sure you want to delete your hotel? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/hotels/${hotel?.id}`);
      toastSuccess('Hotel deleted successfully');
      router.push('/hotels');
    } catch (err: any) {
      toastError(err?.message || 'Failed to delete hotel');
    }
  };

  const handleEditSuccess = () => {
    window.location.reload();
  };

  const handleNextImage = () => {
    if (hotel?.images && hotel.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const handlePrevImage = () => {
    if (hotel?.images && hotel.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Hotel not found</p>
          <p className="text-gray-600 mb-6">{error || 'The hotel you are looking for does not exist.'}</p>
          <Link href="/hotels" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold">
            Back to Hotels
          </Link>
        </div>
      </div>
    );
  }

  const hasMultipleImages = hotel.images && hotel.images.length > 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/hotels" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
            Back to Hotels
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image Section */}
            {hotel.images && hotel.images.length > 0 && (
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative h-96 rounded-2xl overflow-hidden bg-gray-100 group">
                  <img
                    src={hotel.images[currentImageIndex]}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Image Navigation */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-900" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-900" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full text-white text-sm font-medium">
                        {currentImageIndex + 1} / {hotel.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {hasMultipleImages && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {hotel.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                          idx === currentImageIndex
                            ? 'border-teal-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${hotel.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hotel Info Section */}
            <div className="space-y-6">
              {/* Title & Location */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{hotel.name}</h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span className="text-lg">{hotel.city}, {hotel.state}</span>
                </div>

                {/* Rating */}
                {hotel.rating > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-teal-50 px-3 py-2 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-gray-900">{Number(hotel.rating).toFixed(1)}</span>
                    </div>
                    <span className="text-gray-600">
                      {hotel.total_reviews} {hotel.total_reviews === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {hotel.description && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">About this hotel</h2>
                  <p className="text-gray-600 leading-relaxed text-lg">{hotel.description}</p>
                </div>
              )}

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">What this hotel offers</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hotel.amenities.map((amenity, i) => {
                      const Icon = amenityIcons[amenity] || UtensilsCrossed;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-teal-600" />
                          </div>
                          <span className="text-gray-700 font-medium">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rooms Available */}
              {hotel.available_rooms && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <p className="text-blue-900">
                      <strong>{hotel.available_rooms}</strong> rooms available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-4 shadow-sm hover:shadow-md transition">
              {/* Price */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm font-medium mb-1">Price per night</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ₹{hotel.price_per_night.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-600">per night</span>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwnProfile ? (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Hotel
                  </button>
                  <button
                    onClick={handleDeleteHotel}
                    className="w-full px-4 py-3 border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Hotel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition mb-3"
                  >
                    Book Now
                  </button>
                  <p className="text-center text-gray-600 text-sm">
                    ✓ Free cancellation within 48 hours
                  </p>
                </>
              )}

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rooms available:</span>
                  <span className="font-semibold text-gray-900">{hotel.available_rooms || 'N/A'}</span>
                </div>
                {hotel.rating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest rating:</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {Number(hotel.rating).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showBookingModal && (
        <HotelBookingModal
          hotelId={hotel.id}
          hotelName={hotel.name}
          pricePerNight={hotel.price_per_night}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            toastSuccess('Booking created successfully!');
          }}
        />
      )}

      {showEditModal && isOwnProfile && (
        <EditHotelModal
          hotelId={hotel.id}
          initialData={hotel}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSuccess}
        />
      )}
    </div>
  );
}

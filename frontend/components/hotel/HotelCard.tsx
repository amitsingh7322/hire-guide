import { Star, MapPin, Wifi, Coffee, Car } from 'lucide-react';
import Link from 'next/link';
import { Hotel } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Parking': Car,
    'Restaurant': Coffee,
  };

  return (
    <Link href={`/hotels/${hotel.id}`}>
      <div className="card cursor-pointer hover:scale-[1.02] transition-all">
        {/* Image Placeholder */}
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
          {hotel.images && hotel.images.length > 0 ? (
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Coffee className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-sm font-medium rounded-full capitalize">
              {hotel.property_type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg">{hotel.name}</h3>
          {hotel.rating > 0 && (
            <div className="flex items-center gap-1 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-sm">{hotel.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{hotel.city}, {hotel.state}</span>
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 3).map((amenity, index) => {
              const Icon = amenityIcons[amenity] || Coffee;
              return (
                <div key={index} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                  <Icon className="w-3 h-3" />
                  <span>{amenity}</span>
                </div>
              );
            })}
            {hotel.amenities.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(hotel.price_per_night)}
            </span>
            <span className="text-sm text-gray-500">/night</span>
          </div>
          <button className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors">
            View Details
          </button>
        </div>

        {hotel.currently_available_rooms !== undefined && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {hotel.currently_available_rooms > 0 
              ? `${hotel.currently_available_rooms} rooms available`
              : 'No rooms available for selected dates'
            }
          </p>
        )}
      </div>
    </Link>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import HotelCard from '@/components/hotel/HotelCard';
import { api } from '@/lib/api';
import { Hotel, HotelSearchFilters } from '@/types';

export default function HotelsPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HotelSearchFilters>({
    city: searchParams.get('city') || '',
    checkInDate: searchParams.get('checkInDate') || '',
    checkOutDate: searchParams.get('checkOutDate') || '',
  });

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.searchHotels(filters) as { hotels?: Hotel[] } | null | undefined;
      setHotels(response?.hotels ?? []);
    } catch (error:any) {
      console.error('Failed to fetch hotels:', error);
      setError(error.message || 'Failed to load guides'); // Add error state
      setHotels([]); // Clear guides on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Perfect Stay</h1>
          <p className="text-gray-600 dark:text-gray-400">
                      {hotels.length} properties available
                  </p>
              </div>
              {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
              )}


              {/* Search & Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
                  <div className="grid md:grid-cols-4 gap-4">
                      <div>
                          <label className="label">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="label">Check-in</label>
              <input
                type="date"
                value={filters.checkInDate}
                onChange={(e) => handleFilterChange('checkInDate', e.target.value)}
                className="input"
                // min={new Date().toISOString().split('T')}
              />
            </div>
            
            <div>
              <label className="label">Check-out</label>
              <input
                type="date"
                value={filters.checkOutDate}
                onChange={(e) => handleFilterChange('checkOutDate', e.target.value)}
                className="input"
                // min={filters.checkInDate || new Date().toISOString().split('T')}
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </button>
              <button
                onClick={fetchHotels}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">Property Type</label>
                <select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  className="input"
                >
                  <option value="">All Types</option>
                  <option value="hotel">Hotel</option>
                  <option value="guesthouse">Guesthouse</option>
                  <option value="homestay">Homestay</option>
                  <option value="resort">Resort</option>
                  <option value="apartment">Apartment</option>
                </select>
              </div>
              
              <div>
                <label className="label">Min Price (₹/night)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Max Price (₹/night)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-96 animate-pulse bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No hotels found. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

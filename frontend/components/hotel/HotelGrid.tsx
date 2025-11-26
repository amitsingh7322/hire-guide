'use client';

import { useEffect, useState, useMemo  } from 'react';
import { api } from '@/lib/api';
import { Hotel, HotelSearchFilters } from '@/types';
import HotelCard from './HotelCard';

interface HotelGridProps {
  searchData?: HotelSearchFilters;
  limit?: number;
}

export default function HotelGrid({ searchData = {}, limit }: HotelGridProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchDataString = useMemo(() => JSON.stringify(searchData), [searchData]);
  useEffect(() => {
    let mounted = true;
    
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          ...searchData,
          ...(limit && { limit }),
        };
        const response = await api.searchHotels(params);
        
        if (mounted) {
          // Narrow the unknown response to the expected shape before accessing 'hotels'
          const data = (response as { hotels?: Hotel[] } | undefined) ?? undefined;
          setHotels(data?.hotels ?? []);
        }
      } catch (error: any) {
        console.error('Failed to fetch hotels:', error);
        if (mounted) {
          setError(error.message || 'Failed to load hotels');
          setHotels([]); // Clear hotels on error
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHotels();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      mounted = false;
    };
  }, [searchDataString, limit]); // Only re-run when searchData or limit changes

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit || 6)].map((_, i) => (
          <div key={i} className="card h-96 animate-pulse bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-xl font-semibold">Unable to load hotels</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Please check if the backend server is running on port 5000
        </p>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No hotels found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}

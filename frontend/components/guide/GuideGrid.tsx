'use client';

import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { Guide, SearchFilters } from '@/types';
import GuideCard from './GuideCard';

interface GuideGridProps {
  searchData?: SearchFilters;
  limit?: number;
}

export default function GuideGrid({ searchData = {}, limit }: GuideGridProps) {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize searchData to prevent object recreation
  const searchDataString = useMemo(() => JSON.stringify(searchData), [searchData]);

  useEffect(() => {
    let mounted = true;
    
    const fetchGuides = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {
          ...searchData,
          ...(limit && { limit }),
        };
        const response = await api.searchGuides(params) as { guides?: Guide[] } | null;
        
        if (mounted) {
          setGuides(response?.guides || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch guides:', error);
        if (mounted) {
          setError(error.message || 'Failed to load guides');
          setGuides([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchGuides();

    return () => {
      mounted = false;
    };
  }, [searchDataString, limit]); // Use stringified version instead of object!

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(limit || 6)].map((_, i) => (
          <div key={i} className="card h-80 animate-pulse bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-xl font-semibold">Unable to load guides</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Please check if the backend server is running on port 5000
        </p>
      </div>
    );
  }

  if (guides.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No guides found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guides.map((guide) => (
        <GuideCard key={guide.id} guide={guide} />
      ))}
    </div>
  );
}

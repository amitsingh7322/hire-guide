'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import GuideCard from '@/components/guide/GuideCard';
import { api } from '@/lib/api';
import { Guide, SearchFilters } from '@/types';

export default function GuidesPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get('city') || '',
    pinCode: searchParams.get('pinCode') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
  });

  // Memoize filters string to prevent infinite loops
  const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    fetchGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersString]); // Use stringified version!

  const fetchGuides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.searchGuides(filters) as { guides?: Guide[] };
      setGuides(response?.guides ?? []);
    } catch (error: any) {
      console.error('Failed to fetch guides:', error);
      setError(error.message || 'Failed to load guides');
      setGuides([]);
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Local Guides</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {guides.length} verified guides available
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
              <label className="label">PIN Code</label>
              <input
                type="text"
                placeholder="Enter PIN"
                value={filters.pinCode}
                onChange={(e) => handleFilterChange('pinCode', e.target.value)}
                className="input"
              />
            </div>
            
            <div>
              <label className="label">Min Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                className="input"
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
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
                onClick={fetchGuides}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Min Price (₹/hour)</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Max Price (₹/hour)</label>
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
              <div key={i} className="card h-80 animate-pulse bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : guides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No guides found. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

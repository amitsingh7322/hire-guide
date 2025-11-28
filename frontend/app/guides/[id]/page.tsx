'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Star, MapPin, Calendar, Phone, MessageSquare, ChevronLeft, Trophy, Award } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/lib/ToastContext';

interface Guide {
  id: string;
  name: string;
    bio: string;
    city: string;
    state: string;
    profile_image?: string;
    rating: number;
    daily_rate: number;
    specialties?: string[];
    languages?: string[];
    total_tours?: number;
    phone?: string;
    email?: string;
    experience_years?: number;
}

export default function GuideDetailsPage() {
    const params = useParams();
    const guideId = params.id as string;
    const { showError } = useToast();
    const [guide, setGuide] = useState<Guide | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGuide = async () => {
            try {
                const response = await api.get(`/api/guides/${guideId}`);
                // Extract guide from nested structure
                let guideData = null;
                if (response.guide) {
                    // Try to get the first object in guide (it's keyed with "0")
                    guideData = response.guide["0"] || Object.values(response.guide)[0];
                }

                if (!guideData) {
                    throw new Error('Invalid guide data structure');
                }

                setGuide(guideData as Guide);

            } catch (err: any) {
                setError(err.message || 'Failed to load guide');
                showError(err?.message || 'Failed to load guide');
            } finally {
                setLoading(false);
      }
    };

    if (guideId) fetchGuide();
  }, [guideId, showError]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (error || !guide) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-600">{error || 'Guide not found'}</p>
      <Link href="/guides" className="px-4 py-2 bg-teal-600 text-white rounded">Back</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/guides" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
            <ChevronLeft className="w-5 h-5" />
            Back to Guides
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Profile */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex gap-6 mb-6">
                {/* Profile Image */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {guide.profile_image ? (
                    <img src={guide.profile_image} alt={guide.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Trophy className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{guide.name}</h1>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>{guide.city}, {guide.state}</span>
                      </div>
                    </div>
                    {guide.rating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{Number(guide.rating).toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {guide.experience_years && (
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="font-semibold">{guide.experience_years} years</p>
                        </div>
                      </div>
                    )}
                    {guide.total_tours && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="text-sm text-gray-600">Tours</p>
                          <p className="font-semibold">{guide.total_tours}</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-semibold text-teal-600">{formatCurrency(guide.daily_rate)}/day</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {guide.bio && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="font-semibold text-lg mb-2">About</h2>
                  <p className="text-gray-700">{guide.bio}</p>
                </div>
              )}

              {/* Specialties */}
              {guide.specialties && guide.specialties.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h2 className="font-semibold text-lg mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((s, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {guide.languages && guide.languages.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages.map((lang, i) => (
                      <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Booking */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 sticky top-4">
              <p className="text-sm text-gray-600">Price per day</p>
              <p className="text-3xl font-bold text-teal-600 mb-6">
                {formatCurrency(guide.daily_rate)}
              </p>

              {guide.phone && (
                <div className="mb-4 flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <a href={`tel:${guide.phone}`}>{guide.phone}</a>
                </div>
              )}

              {guide.email && (
                <div className="mb-6 flex items-center gap-2 text-gray-700">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <a href={`mailto:${guide.email}`}>{guide.email}</a>
                </div>
              )}

              <button className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg mb-3">
                Book Tour
              </button>

              <button className="w-full px-4 py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-lg">
                Message Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

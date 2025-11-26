import { Star, MapPin, Languages, Car, Check } from 'lucide-react';
import Link from 'next/link';
import { Guide } from '@/types';
import { formatCurrency, getInitials } from '@/lib/utils';

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const initials = getInitials(guide.first_name, guide.last_name);

  return (
    <Link href={`/guides/${guide.id}`}>
      <div className="card cursor-pointer hover:scale-[1.02] transition-all">
        <div className="flex gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {initials}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg truncate">
                                  {guide.first_name} {guide.last_name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">
                                      {Number(guide.rating || 0).toFixed(1)}
                                  </span>
                                  <span>({guide.total_reviews} reviews)</span>
                              </div>
                          </div>
                          {guide.is_verified && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{guide.city}, {guide.state} - {guide.pin_code}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Languages className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{guide.languages.join(', ')}</span>
          </div>
          
          {guide.vehicles && guide.vehicles.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
              <Car className="w-4 h-4 flex-shrink-0" />
              <span>{guide.vehicles.length} vehicle(s) available</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {guide.specialties.slice(0, 3).map((specialty) => (
            <span 
              key={specialty}
              className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
          {guide.specialties.length > 3 && (
            <span className="px-2 py-1 text-xs text-gray-500">
              +{guide.specialties.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {formatCurrency(guide.hourly_rate)}
            </span>
            <span className="text-gray-500 text-sm">/hour</span>
          </div>
          <button className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
}

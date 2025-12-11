'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Users, Star, Car, Hotel, MessageCircle } from 'lucide-react';
import GuideGrid from '@/components/guide/GuideGrid';
import { useAuth } from '@/lib/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchType, setSearchType] = useState<'guides' | 'hotels'>('guides');
  const [searchData, setSearchData] = useState({
    location: '',
    pinCode: '',
    date: '',
    numberOfPeople: 1,
  });

  const handleSearch = () => {
    if (searchType === 'guides') {
      const params = new URLSearchParams({
        ...(searchData.location && { city: searchData.location }),
        ...(searchData.pinCode && { pinCode: searchData.pinCode }),
      });
      router.push(`/guides?${params}`);
    } else {
      const params = new URLSearchParams({
        ...(searchData.location && { city: searchData.location }),
        ...(searchData.date && { checkInDate: searchData.date }),
      });
      router.push(`/hotels?${params}`);
    }
  };
  // ✅ ADD THIS: Redirect owners/guides to dashboard
  useEffect(() => {
    if (loading) return;

    if (user?.role === 'hotel_owner') {
      router.push('/hotels/dashboard');
      return;
    }

    if (user?.role === 'guide') {
      router.push('/guides/dashboard');
      return;
    }
  }, [user, loading, router]);
  // Show loading while checking role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 text-white py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Local Guides & <br />
              <span className="text-yellow-300">Unforgettable Experiences</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-95">
              Connect with verified local guides and find perfect accommodations in Sikkim
            </p>

            {/* Search Type Toggle */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setSearchType('guides')}
                className={`px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${searchType === 'guides'
                    ? 'bg-white text-teal-600 shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
              >
                <Users className="w-5 h-5" />
                Find Guides
              </button>
              <button
                onClick={() => setSearchType('hotels')}
                className={`px-8 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${searchType === 'hotels'
                    ? 'bg-white text-teal-600 shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
              >
                <Hotel className="w-5 h-5" />
                Find Hotels
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto border border-gray-100 dark:border-gray-700">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="label">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="City or Area"
                  value={searchData.location}
                  onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                  className="input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="label">PIN Code</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter PIN"
                  value={searchData.pinCode}
                  onChange={(e) => setSearchData({ ...searchData, pinCode: e.target.value })}
                  className="input pl-11"
                />
              </div>
            </div>

            <div>
              <label className="label">{searchType === 'guides' ? 'Tour Date' : 'Check-in'}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={searchData.date}
                  onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                  className="input pl-11"
                />

              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-3 flex-wrap justify-center">
          <button className="px-5 py-2.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors font-medium flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" />
            Top Rated
          </button>
          <button className="px-5 py-2.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium flex items-center gap-2">
            <Car className="w-4 h-4" />
            Has Vehicle
          </button>
          <button className="px-5 py-2.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium">
            💰 Budget Friendly
          </button>
          <button className="px-5 py-2.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors font-medium">
            ✅ Verified Only
          </button>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Featured Local Guides
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore Sikkim with expert local guides
          </p>
        </div>
        <GuideGrid limit={6} />
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose HireGuide Connect?
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-10 h-10 text-teal-600 dark:text-teal-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verified Guides</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All guides are verified with proper documentation and authentic reviews
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="w-10 h-10 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Local Expertise</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Experience authentic local culture with knowledgeable guides
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Booking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Book with transparent pricing and easy cancellation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-500 to-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers discovering Sikkim with local experts
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/guides')}
              className="px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse All Guides
            </button>
            <button
              onClick={() => router.push('/hotels')}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border-2 border-white/30"
            >
              Explore Hotels
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

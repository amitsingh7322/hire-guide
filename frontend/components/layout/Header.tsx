'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, LogOut, Menu, X } from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('=== Header useEffect MOUNTED ===');
    
    const checkAuth = async () => {
      try {
        console.log('Starting checkAuth...');
        
        const token = localStorage.getItem('authToken');
        console.log('Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
        
        if (!token) {
          console.log('No token, setting user to null');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('Token exists, fetching user data...');
        
        // Fetch user data from backend
        const userData = await api.checkAuth();
        console.log('User data received:', userData);
        
        if (userData) {
          console.log('Setting user:', userData);
          setUser(userData);
        } else {
          console.log('No user data returned, clearing auth');
          setUser(null);
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        localStorage.removeItem('authToken');
      } finally {
        console.log('checkAuth complete');
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array - runs once on mount

  const handleLogout = () => {
    console.log('Logging out...');
    api.clearToken();
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/');
    window.location.reload();
  };

  console.log('Header render:', { loading, userExists: !!user });

  if (loading) {
    return <div className="h-16 bg-white shadow flex items-center"><span className="ml-4">Loading...</span></div>;
  }

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">HireGuide</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/guides" className="text-gray-600 hover:text-gray-900 transition">
            Find Guides
          </Link>
          <Link href="/hotels" className="text-gray-600 hover:text-gray-900 transition">
            Hotels
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-gray-900 font-semibold">
                  {user.firstName || user.email}
                </span>
                {user.role && <span className="text-xs text-gray-600">{user.role}</span>}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2 text-teal-600 font-semibold hover:bg-teal-50 rounded transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-teal-600 text-white font-semibold rounded hover:bg-teal-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/guides" className="block text-gray-600 hover:text-gray-900">
              Find Guides
            </Link>
            <Link href="/hotels" className="block text-gray-600 hover:text-gray-900">
              Hotels
            </Link>
            {user ? (
              <>
                <div className="py-2 border-t">
                  <p className="text-gray-900 font-semibold">{user.firstName}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:bg-red-50 px-2 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-teal-600 font-semibold">
                  Login
                </Link>
                <Link href="/register" className="block bg-teal-600 text-white px-4 py-2 rounded">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

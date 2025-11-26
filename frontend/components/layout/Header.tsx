'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, MapPin, Hotel, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = api.getToken();
            if (token) {
                const response = await api.getCurrentUser();
                // response is unknown — narrow and check shape before accessing .user
                if (response && typeof response === 'object' && 'user' in response) {
                    setUser((response as any).user);
                } else {
                    console.warn('Unexpected response shape from getCurrentUser:', response);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    };

    const handleLogout = () => {
        api.clearToken();
        setUser(null);
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                            HireGuide
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/guides"
                            className={`font-medium transition-colors ${isActive('/guides')
                                    ? 'text-teal-600 dark:text-teal-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                                }`}
                        >
                            Find Guides
                        </Link>
                        <Link
                            href="/hotels"
                            className={`font-medium transition-colors ${isActive('/hotels')
                                    ? 'text-teal-600 dark:text-teal-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                                }`}
                        >
                            Hotels
                        </Link>
                        {user && (
                            <Link
                                href="/bookings"
                                className={`font-medium transition-colors ${isActive('/bookings')
                                        ? 'text-teal-600 dark:text-teal-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400'
                                    }`}
                            >
                                My Bookings
                            </Link>
                        )}
                    </nav>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                    </div>
                                    <span className="font-medium">{user.firstName}</span>
                                </button>


                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <User className="w-4 h-4 inline mr-2" />
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                                        >
                                            <LogOut className="w-4 h-4 inline mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
                        <nav className="flex flex-col gap-2">
                            <Link href="/guides" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                Find Guides
                            </Link>
                            <Link href="/hotels" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                Hotels
                            </Link>
                            {user ? (
                                <>
                                    <Link href="/bookings" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        My Bookings
                                    </Link>
                                    <Link href="/dashboard" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-red-600 dark:text-red-400"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                        Login
                                    </Link>
                                    <Link href="/register" className="px-4 py-2 bg-teal-500 text-white rounded-lg text-center">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}

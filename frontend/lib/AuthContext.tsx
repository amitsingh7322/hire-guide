'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: false,
  setLoading: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
        console.log('🔍 AuthContext checking authentication status...');
      try {
        const storedUser = localStorage.getItem('authUser');
        const token = localStorage.getItem('authToken');

        console.log('🔍 AuthContext checkAuth - storedUser:', !!storedUser, 'token:', !!token);

        if (storedUser && token) {
          console.log('✅ Using stored user from localStorage',JSON.parse(storedUser) );

          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        if (!token) {
          console.log('❌ No token found');
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('📡 Fetching user from /api/auth/me');
        const userData = await api.checkAuth();
        if (userData) {
          console.log('✅ User fetched:', userData);
          setUser(userData);
          localStorage.setItem('authUser', JSON.stringify(userData));
        } else {
          api.clearToken();
          setUser(null);
        }
      } catch (err) {
        console.error('❌ AuthContext checkAuth error:', err);
        api.clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    console.log('🔴 Logging out...');
    api.clearToken();
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

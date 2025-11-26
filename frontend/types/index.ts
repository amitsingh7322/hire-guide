export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roles: string[];
}

export interface Guide {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio: string;
  city: string;
  state: string;
  pin_code: string;
  address: string;
  latitude: number;
  longitude: number;
  hourly_rate: number;
  daily_rate: number;
  experience_years: number;
  specialties: string[];
  languages: string[];
  rating: number;
  total_reviews: number;
  total_bookings: number;
  is_verified: boolean;
  vehicles?: Vehicle[];
  reviews?: Review[];
}

export interface Vehicle {
  id: string;
  guide_id: string;
  type: 'bike' | 'car' | 'scooter' | 'suv';
  make: string;
  model: string;
  year: number;
  rental_rate_per_day: number;
  features: string[];
  images: string[];
  available: boolean;
}

export interface Hotel {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  property_type: 'hotel' | 'guesthouse' | 'homestay' | 'resort' | 'apartment';
  address: string;
  city: string;
  state: string;
  pin_code: string;
  latitude: number;
  longitude: number;
  price_per_night: number;
  total_rooms: number;
  available_rooms: number;
  currently_available_rooms?: number;
  amenities: string[];
  images: string[];
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  contact_phone?: string;
  contact_email?: string;
  reviews?: Review[];
}

export interface Booking {
  id: string;
  tourist_id: string;
  guide_id: string;
  booking_type: 'guide' | 'vehicle' | 'both';
  booking_date: string;
  duration_hours: number;
  number_of_people: number;
  vehicle_id?: string;
  guide_amount: number;
  vehicle_amount: number;
  platform_fee: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: string;
  payment_intent_id?: string;
  special_requests?: string;
  created_at: string;
  guide_name?: string;
  guide_city?: string;
  guide_phone?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  guide_id?: string;
  hotel_id?: string;
  tourist_id: string;
  rating: number;
  comment: string;
  images?: string[];
  guide_response?: string;
  created_at: string;
  tourist_name?: string;
  tourist_avatar?: string;
}

export interface Message {
  id: string;
  booking_id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface SearchFilters {
  city?: string;
  pinCode?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  languages?: string[];
  specialties?: string[];
  hasVehicle?: boolean;
  date?: string;
  page?: number;
  limit?: number;
}

export interface HotelSearchFilters {
  city?: string;
  pinCode?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  checkInDate?: string;
  checkOutDate?: string;
  numberOfRooms?: number;
  page?: number;
  limit?: number;
}

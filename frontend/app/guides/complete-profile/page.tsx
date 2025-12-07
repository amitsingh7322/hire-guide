'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/ToastContext';
import { MapPin, DollarSign, Award, Languages } from 'lucide-react';

export default function CompleteGuideProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    dailyRate: '',
    hourlyRate: '',
    experienceYears: '',
    specialties: [] as string[],
    languages: [] as string[],
    certifications: [] as string[],
  });

  const specialtiesOptions = [
    'Trekking',
    'Mountain Climbing',
    'Cultural Tours',
    'Photography',
    'Wildlife',
    'Adventure',
    'Historical Sites',
    'Food Tours',
  ];

  const languagesOptions = [
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese',
    'Local Language',
  ];

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language],
    }));
  };

  const handleAddCertification = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      if (input.value.trim()) {
        setFormData(prev => ({
          ...prev,
          certifications: [...prev.certifications, input.value.trim()],
        }));
        input.value = '';
      }
    }
  };

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/guides/profile', formData);
      
      if (response.success || response.guide) {
        toastSuccess('Profile created successfully!');
        setTimeout(() => {
          router.push('/guides/dashboard');
        }, 1000);
      }
    } catch (err: any) {
      toastError(err?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Your Guide Profile</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div>
              <label className="label">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="input min-h-24"
                placeholder="Tell visitors about yourself..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="input"
                  placeholder="Gangtok"
                  required
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="input"
                  placeholder="Sikkim"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="input"
                placeholder="MG Marg, Gangtok"
              />
            </div>

            <div>
              <label className="label">Pin Code</label>
              <input
                type="text"
                value={formData.pinCode}
                onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                className="input"
                placeholder="737101"
              />
            </div>
          </div>

          {/* Rates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Daily Rate (₹)</label>
                <input
                  type="number"
                  value={formData.dailyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
                  className="input"
                  placeholder="10000"
                  required
                />
              </div>
              <div>
                <label className="label">Hourly Rate (₹)</label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  className="input"
                  placeholder="1500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Experience (Years)</label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                className="input"
                placeholder="5"
                required
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Award className="w-5 h-5" />
              Specialties (Select all that apply)
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              {specialtiesOptions.map((specialty) => (
                <label key={specialty} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyToggle(specialty)}
                    className="w-4 h-4"
                  />
                  <span>{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Languages (Select all that apply)
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              {languagesOptions.map((language) => (
                <label key={language} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="w-4 h-4"
                  />
                  <span>{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Certifications</h2>
            
            <input
              type="text"
              placeholder="Type certification and press Enter"
              onKeyPress={handleAddCertification}
              className="input"
            />
            
            <div className="flex flex-wrap gap-2">
              {formData.certifications.map((cert, index) => (
                <span key={index} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

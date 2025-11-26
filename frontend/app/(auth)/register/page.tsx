// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Mail, Lock, User, Phone, Eye, EyeOff, MapPin } from 'lucide-react';
// import { api } from '@/lib/api';
// import { useToast } from '@/lib/ToastContext';

// export default function RegisterPage() {
//   const router = useRouter();
//   const { showSuccess, showError } = useToast();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     role: 'tourist',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // const [error, setError] = useState('');

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       showError('Passwords do not match');
//       return;
//     }

//     if (formData.password.length < 6) {
//       showError('Password must be at least 6 characters');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await api.register(formData) as { token?: string };
//       console.log('Registration response:', response);
//       if (!response || typeof response.token !== 'string') {
//         throw new Error('Invalid response from registration');
//       }
//       api.setToken(response.token);
//       showSuccess('Registration successful! Redirecting...');
//       router.push('/');
//       window.location.reload(); // Refresh to update header
//     } catch (err: any) {
//       console.error('Registration error:', err);
//       showError(err?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center py-12 px-4">
//       <div className="max-w-md w-full">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <Link href="/" className="inline-flex items-center gap-2 group">
//             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//               <MapPin className="w-7 h-7 text-teal-600" />
//             </div>
//             <span className="text-3xl font-bold text-white">HireGuide</span>
//           </Link>
//         </div>

//         {/* Register Card */}
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
//             Create Account
//           </h2>

//           {/* {error && (
//             <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
//               {error}
//             </div>
//           )} */}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="label">First Name</label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   className="input"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="label">Last Name</label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   className="input"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="input pl-11"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">Phone</label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className="input pl-11"
//                   placeholder="+91 98765 43210"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="label">I am a</label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="input"
//               >
//                 <option value="tourist">Tourist</option>
//                 <option value="guide">Local Guide</option>
//                 <option value="hotel_owner">Hotel Owner</option>
//               </select>
//             </div>

//             <div>
//               <label className="label">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   className="input pl-11 pr-11"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             <div>
//               <label className="label">Confirm Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className="input pl-11"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="btn-primary w-full"
//             >
//               {loading ? 'Creating account...' : 'Create Account'}
//             </button>
//           </form>

//           <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
//             Already have an account?{' '}
//             <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Phone, Eye, EyeOff, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'tourist',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register(formData);
      // validate response at runtime to avoid using unknown
      if (
        !response ||
        typeof response !== 'object' ||
        !('token' in response) ||
        typeof (response as any).token !== 'string'
      ) {
        throw new Error('Invalid response from registration');
      }
      api.setToken((response as { token: string }).token);
      showSuccess('Registration successful! Redirecting...');
      setTimeout(() => {
        router.push('/');
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7 text-teal-600" />
            </div>
            <span className="text-3xl font-bold text-white">TourSpot</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input pl-11"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="label">I am a</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input"
              >
                <option value="tourist">Tourist</option>
                <option value="guide">Local Guide</option>
                <option value="hotel_owner">Hotel Owner</option>
              </select>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input pl-11"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

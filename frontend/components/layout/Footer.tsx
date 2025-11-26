import Link from 'next/link';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">HireGuide</span>
            </div>
            <p className="text-sm">
              Connecting travelers with local guides and accommodations across Sikkim.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/guides" className="hover:text-teal-400 transition-colors">Find Guides</Link></li>
              <li><Link href="/hotels" className="hover:text-teal-400 transition-colors">Hotels</Link></li>
              <li><Link href="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* For Guides */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Service Providers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/become-guide" className="hover:text-teal-400 transition-colors">Become a Guide</Link></li>
              <li><Link href="/list-property" className="hover:text-teal-400 transition-colors">List Your Property</Link></li>
              <li><Link href="/guide-resources" className="hover:text-teal-400 transition-colors">Resources</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:hello@hireguide.com" className="hover:text-teal-400 transition-colors">
                  hello@hireguide.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+919876543210" className="hover:text-teal-400 transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="hover:text-teal-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} HireGuide Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

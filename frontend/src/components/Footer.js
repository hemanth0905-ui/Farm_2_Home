import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-harvest-green text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="h-6 w-6" />
              <span className="text-xl font-bold">The Modern Harvest</span>
            </div>
            <p className="text-sm text-white/80">
              Connecting farmers directly with consumers. Fresh, local, and sustainable.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white/80 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-white/80 transition-colors">Products</Link></li>
              <li><Link to="/register" className="hover:text-white/80 transition-colors">Become a Farmer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white/80 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@modernharvest.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/80">
          <p>&copy; 2026 The Modern Harvest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
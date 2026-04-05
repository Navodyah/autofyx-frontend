'use client';

import { Car, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-[#030303]/90 backdrop-blur-md border-b border-white/5 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="border border-white/20 p-1.5 rounded-md">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              AutoFyx
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#methodology" className="text-sm text-gray-400 hover:text-white transition-colors">
              Methodology
            </a>
            <a href="#intelligence" className="text-sm text-gray-400 hover:text-white transition-colors">
              Intelligence
            </a>
            <a href="#inventory" className="text-sm text-gray-400 hover:text-white transition-colors">
              Inventory
            </a>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <button className="bg-white text-black px-5 py-2.5 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Start Match
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 bg-[#030303]">
            <a
              href="#methodology"
              className="block text-sm text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Methodology
            </a>
            <a
              href="#intelligence"
              className="block text-sm text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Intelligence
            </a>
            <a
              href="#inventory"
              className="block text-sm text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Inventory
            </a>
            <div className="flex flex-col space-y-4 pt-4 border-t border-white/5">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white">
                Sign In
              </Link>
              <button className="w-full bg-white text-black px-4 py-2.5 rounded-md text-sm font-medium">
                Start Match
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
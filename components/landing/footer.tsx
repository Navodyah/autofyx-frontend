import { Car } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#030303] py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Side: Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-white" />
            <span className="text-xl font-semibold text-white tracking-tight">
              AutoFyx
            </span>
          </Link>
          <p className="text-gray-500 text-sm">
            Intelligent Vehicle Curation
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
            Platform
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-8 bg-gradient-to-r from-black to-gray-800 shadow-sm mt-auto">
      <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
        <Link 
          href="/about" 
          className="text-white hover:text-gray-200 transition-colors"
        >
          About
        </Link>
        <Link 
          href="/contact" 
          className="text-white hover:text-gray-200 transition-colors"
        >
          Contact
        </Link>
        <div className="text-white">
          Made with love in Palo Alto
        </div>
      </div>
    </footer>
  );
} 
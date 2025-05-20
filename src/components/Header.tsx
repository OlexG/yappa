import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-2 bg-gradient-to-r from-white to-gray-300 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image
            src="/yappa.png"
            alt="YAPPA Logo"
            width={37}
            height={37}
            className="object-contain"
          />
          <h1 className="text-3xl font-bold font-space-grotesk tracking-wider text-black">YAPPA</h1>
        </Link>
        <div className="flex gap-3">
          <Link 
            href="/try" 
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white hover:border-gray-600 transition-colors"
          >
            Try App
          </Link>
          <Link 
            href="/about" 
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white hover:border-gray-600 transition-colors"
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
} 
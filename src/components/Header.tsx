"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isLearnPage = pathname.startsWith('/learn');

  if (isLearnPage) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/yappa.png"
                alt="Yappa Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">Yappa</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-8">
            <Link 
              href="/try" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Try App
            </Link>
            <Link 
              href="/auth/signin" 
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 
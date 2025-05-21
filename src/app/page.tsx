"use client";
import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-100/40 via-gray-200/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-gray-100/30 to-transparent"></div>
        <Header />
        <div className="p-6 md:pt-12 md:px-24 relative">
          <div className="max-w-4xl mx-auto text-center mt-16">
            <h1 className="text-6xl md:text-7xl font-medium bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-tight">
              Learn Anything.<br />
              <span className="inline-block pt-2">Anywhere.</span>
            </h1>
            <div className="mt-8 flex justify-center">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg 
                  className="w-6 h-6" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download Yappa
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

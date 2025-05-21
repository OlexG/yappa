"use client";
import React from 'react';
import Header from '@/components/Header';
import TypewriterText from '@/components/TypewriterText';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-white to-teal-50">
        <Header />
        <div className="p-6 md:p-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mt-32 ml-4 md:ml-8">
              Learn anything.<br />
              <TypewriterText />
            </h1>
            <div className="ml-4 md:ml-8 mt-8">
              <Link 
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Join Yappa
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" 
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

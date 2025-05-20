"use client";
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TypewriterText from '@/components/TypewriterText';

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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

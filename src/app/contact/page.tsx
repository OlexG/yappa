"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function ContactPage() {
  const [showCopied, setShowCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('contact@yappa.ai');
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1000); // Hide after 1 second
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-white to-gray-100">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="space-y-8">
            <p className="text-3xl font-medium text-gray-900 leading-relaxed">
              Have questions or feedback? Reach out to us at{' '}
              <button
                onClick={copyEmail}
                className="text-blue-600 hover:text-blue-800 transition-colors relative"
                title="Click to copy email"
              >
                contact@yappa.ai
                {showCopied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap animate-fade-in-out">
                    Email copied!
                  </span>
                )}
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
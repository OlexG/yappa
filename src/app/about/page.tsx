"use client";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-white to-gray-100">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="space-y-8">
            <p className="text-3xl font-medium text-gray-900 leading-relaxed">
              Yappa is an AI-powered learning platform that transforms complex topics into engaging, easy-to-understand lessons.
            </p>
            <p className="text-3xl font-medium text-gray-900 leading-relaxed">
              Choose any topic, select your preferred learning duration, and let our AI create a personalized learning experience with audio narration.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { APP_CONFIG } from '@/constants/config';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [timeSelected, setTimeSelected] = useState<number | null>(null);
  const router = useRouter();
  
  const handleStartLearning = () => {
    if (topic && timeSelected) {
      // Store the topic and time in localStorage for the learn page to access
      localStorage.setItem('learningTopic', topic);
      localStorage.setItem('learningTime', timeSelected.toString());
      
      // Navigate to the first section
      router.push('/learn/1');
    }
  };
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-6 md:p-24">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">
          Welcome to Yappa
        </h1>
        
        <div className="mb-12">
          <label className="block text-2xl font-medium text-center mb-6 text-gray-700">
            What would you like to learn today?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic or subject..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
          />
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-medium text-center mb-6 text-gray-700">
            How much time do you have?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {APP_CONFIG.timeOptions.map((option) => (
              <button
                key={option.totalMinutes}
                onClick={() => setTimeSelected(option.totalMinutes)}
                className={`p-5 text-lg font-medium rounded-lg transition-colors ${
                  timeSelected === option.totalMinutes
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {option.displayName}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleStartLearning}
            disabled={!topic || !timeSelected}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start Learning
          </button>
        </div>
      </div>
    </main>
  );
}

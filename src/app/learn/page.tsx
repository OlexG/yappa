'use client';

import { useState, useRef, useEffect } from 'react';

export default function LearnPage() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Set up event handlers
      audioRef.current.onplaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onerror = () => {
        console.error('Audio error occurred');
        setIsLoading(false);
        setIsPlaying(false);
      };
    }
    
    return () => {
      stopPlayback();
    };
  }, []);
  
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };
  
  const handleSpeak = () => {
    if (!text || !audioRef.current) return;
    
    // Stop any current playback
    stopPlayback();
    
    setIsLoading(true);
    
    // Direct streaming using query parameter
    // This approach lets the browser handle streaming natively
    audioRef.current.src = `/api/text-to-speech?text=${encodeURIComponent(text)}`;
    
    // Start loading/buffering immediately
    audioRef.current.load();
    
    // Play as soon as enough data is buffered
    audioRef.current.play().catch(err => {
      console.error('Failed to play audio:', err);
      setIsLoading(false);
    });
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Learn with Text-to-Speech</h1>
      <div className="mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows={5}
          placeholder="Enter text to be spoken..."
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSpeak}
          disabled={isLoading || !text}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Loading...' : 'Speak Text'}
        </button>
        
        {isPlaying && (
          <button
            onClick={stopPlayback}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Stop Audio
          </button>
        )}
      </div>
    </div>
  );
} 
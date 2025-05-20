"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LEARNING_PROMPTS } from '@/constants/prompts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LearnSection() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [timeSelected, setTimeSelected] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load data from localStorage
    const storedTopic = localStorage.getItem('learnTopic');
    const storedTime = localStorage.getItem('learnTime');
    const storedSections = localStorage.getItem('learnSections');

    if (!storedTopic || !storedTime || !storedSections) {
      router.push('/learn');
      return;
    }

    setTopic(storedTopic);
    setTimeSelected(parseInt(storedTime));
    
    try {
      const parsedSections = JSON.parse(storedSections);
      setSections(parsedSections);
      const currentSectionNumber = parseInt(params.sectionId as string);
      const section = parsedSections[currentSectionNumber - 1];
      setCurrentSection(section);
    } catch (error) {
      console.error('Error parsing sections:', error);
      router.push('/learn');
    }
  }, [params.sectionId, router]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.onplaying = () => {
        setIsPlaying(true);
        setIsAudioLoading(false);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onerror = () => {
        console.error('Audio error occurred');
        setIsPlaying(false);
        setIsAudioLoading(false);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (currentSection && topic && timeSelected) {
      loadSectionContent();
    }
  }, [currentSection, topic, timeSelected]);

  const loadSectionContent = async () => {
    if (!currentSection || !topic || !timeSelected) return;
    
    setIsLoading(true);
    
    try {
      const previousSections = sections
        .slice(0, currentSection.number - 1)
        .map(s => `${s.number}. ${s.title}`)
        .join(', ');
      
      const prompt = LEARNING_PROMPTS.SECTION_CONTENT
        .replace('{{TOPIC}}', topic)
        .replace('{{SECTION_TITLE}}', currentSection.title)
        .replace('{{SECTION_NUMBER}}', currentSection.number.toString())
        .replace('{{TOTAL_SECTIONS}}', sections.length.toString())
        .replace('{{TIME_PER_SECTION}}', (timeSelected / sections.length).toString())
        .replace('{{PREVIOUS_SECTIONS}}', previousSections || 'None');
      
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      setContent(data.content);
      setIsLoading(false);
      
      // Wait for content to be set before playing audio
      setTimeout(() => {
        playAudio(data.content);
      }, 100);
    } catch (error) {
      console.error('Error generating content:', error);
      setIsLoading(false);
    }
  };

  const playAudio = (text: string) => {
    if (!audioRef.current) return;
    
    setIsAudioLoading(true);
    
    // Stop any current playback
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    // Set up loading event handler
    const handleCanPlay = () => {
      audioRef.current?.play()
        .then(() => {
          setIsAudioLoading(false);
        })
        .catch(err => {
          console.error('Failed to play audio:', err);
          setIsAudioLoading(false);
        });
      
      // Remove the event listener after it's used
      audioRef.current?.removeEventListener('canplaythrough', handleCanPlay);
    };
    
    // Add the event listener before setting the source
    audioRef.current.addEventListener('canplaythrough', handleCanPlay);
    
    // Set source and load
    audioRef.current.src = `/api/text-to-speech?text=${encodeURIComponent(text)}`;
    audioRef.current.load();
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsAudioLoading(false);
  };

  const handleNextSection = () => {
    if (currentSection && currentSection.number < sections.length) {
      router.push(`/learn/${currentSection.number + 1}`);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection && currentSection.number > 1) {
      router.push(`/learn/${currentSection.number - 1}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-white to-gray-100">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg text-gray-700">Preparing your learning content...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {topic}
                </h1>
                <div className="mt-2 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gray-900 h-2.5 rounded-full" 
                      style={{ width: `${(currentSection?.number / sections.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {currentSection?.number}/{sections.length}
                  </span>
                </div>
              </div>
              
              {currentSection && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {currentSection.number}. {currentSection.title}
                  </h2>
                  <p className="text-gray-600 italic mb-4">{currentSection.description}</p>
                  
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">{content}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={handlePreviousSection}
                  disabled={!currentSection || currentSection.number <= 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                
                <div className="flex gap-3">
                  {isPlaying ? (
                    <button
                      onClick={stopPlayback}
                      className="px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Stop Audio
                    </button>
                  ) : (
                    <button
                      onClick={() => playAudio(content)}
                      disabled={isAudioLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      {isAudioLoading ? 'Loading...' : 'Play Audio'}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={handleNextSection}
                  disabled={!currentSection || currentSection.number >= sections.length}
                  className="px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 
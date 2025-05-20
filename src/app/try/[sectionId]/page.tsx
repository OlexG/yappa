"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LEARNING_PROMPTS } from '@/constants/prompts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TrySection() {
  const [content, setContent] = useState<string>('');
  const [sections, setSections] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [topic, setTopic] = useState('');
  const [timeSelected, setTimeSelected] = useState<number | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const params = useParams();
  const router = useRouter();
  const sectionId = parseInt(params.sectionId as string);
  
  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.onplaying = () => {
        setIsPlaying(true);
        setIsAudioLoading(false);
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        // Automatically go to next section if available
        if (sections.length > 0 && sectionId < sections.length) {
          router.push(`/try/${sectionId + 1}`);
        }
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
  
  // Load data from localStorage
  useEffect(() => {
    const savedTopic = localStorage.getItem('tryTopic');
    const savedTimeStr = localStorage.getItem('tryTime');
    const savedSections = localStorage.getItem('trySections');
    
    if (!savedTopic || !savedTimeStr || !savedSections) {
      router.push('/try');
      return;
    }

    const totalMinutes = parseInt(savedTimeStr);
    setTopic(savedTopic);
    setTimeSelected(totalMinutes);
    
    try {
      const parsedSections = JSON.parse(savedSections);
      setSections(parsedSections);
      
      if (sectionId > 0 && sectionId <= parsedSections.length) {
        setCurrentSection(parsedSections[sectionId - 1]);
        loadSectionContent(savedTopic, parsedSections, sectionId, totalMinutes / parsedSections.length);
      } else {
        router.push('/try/1');
      }
    } catch (error) {
      console.error('Error loading sections:', error);
      router.push('/try');
    }
  }, [sectionId, router]);

  const loadSectionContent = async (
    topic: string, 
    allSections: any[], 
    sectionNumber: number,
    timePerSection: number
  ) => {
    setIsLoading(true);
    
    try {
      const section = allSections[sectionNumber - 1];
      const previousSections = allSections
        .slice(0, sectionNumber - 1)
        .map(s => `${s.number}. ${s.title}`)
        .join(', ');
      
      const prompt = LEARNING_PROMPTS.SECTION_CONTENT
        .replace('{{TOPIC}}', topic)
        .replace('{{SECTION_TITLE}}', section.title)
        .replace('{{SECTION_NUMBER}}', section.number.toString())
        .replace('{{TOTAL_SECTIONS}}', allSections.length.toString())
        .replace('{{TIME_PER_SECTION}}', timePerSection.toString())
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
      const generatedContent = data.content;
      
      setContent(generatedContent);
      setIsLoading(false);
      
      // Wait for content to be set before playing audio
      setTimeout(() => {
        playAudio(generatedContent);
      }, 100);
    } catch (error) {
      console.error('Error loading section content:', error);
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

  const navigateToSection = (sectionNumber: number) => {
    if (sectionNumber > 0 && sectionNumber <= sections.length) {
      router.push(`/try/${sectionNumber}`);
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
                      style={{ width: `${(sectionId / sections.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {sectionId}/{sections.length}
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
                  onClick={() => navigateToSection(sectionId - 1)}
                  disabled={sectionId <= 1}
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
                  onClick={() => navigateToSection(sectionId + 1)}
                  disabled={sectionId >= sections.length}
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
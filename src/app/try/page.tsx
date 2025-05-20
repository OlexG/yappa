"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { APP_CONFIG } from '@/constants/config';
import { LEARNING_PROMPTS } from '@/constants/prompts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const examples = [
  "Why did the Roman Empire fall apart?",
  "What makes quantum computers different from regular ones?",
  "How do suspension bridges even hold up?",
  "How do neural networks figure stuff out?",
  "Industrial Revolution in France?",
  "What is the blockchain?",
  "How do airplanes fly?",
  "Explain the Cold War start to finish",
  "Why do we dream?",
  "What are black holes?",
  "History of the internet",
  "How do submarines work?",
  "RAM vs cache?",
  "Why are hash functions so important in cryptography?",
  "How do hard drives work?",
  "How do GPUs work?",
  "Why should I learn to use Git?"
];


const TIME_OPTIONS = [
  { value: 1, label: '1m', disabled: false },
  { value: 5, label: '5m', disabled: false },
  { value: 15, label: '15m', disabled: true },
  { value: 60, label: '1hr', disabled: true },
  { value: 240, label: '4hrs', disabled: true },
];

export default function TryPage() {
  const [topic, setTopic] = useState('');
  const [timeSelected, setTimeSelected] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [showInput, setShowInput] = useState(true);
  const currentTextRef = useRef('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const randomExample = examples[Math.floor(Math.random() * examples.length)];

    const typeText = () => {
      if (currentTextRef.current.length < randomExample.length) {
        currentTextRef.current += randomExample[currentTextRef.current.length];
        setPlaceholder(currentTextRef.current);
        timeout = setTimeout(typeText, 30);
      }
    };

    typeText();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

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

  const generateSections = async () => {
    if (!topic || !timeSelected) return;
    
    setIsLoading(true);
    
    try {
      const prompt = LEARNING_PROMPTS.TOPIC_SPLITTER
        .replace('{{TOPIC}}', topic)
        .replace('{{TIME}}', timeSelected.toString())
        .replace('{{SECTIONS_COUNT}}', '3')
        .replace('{{TIME_PER_SECTION}}', (timeSelected / 3).toString());
      
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate sections');
      }
      
      const data = await response.json();
      let generatedSections = data.content;

      // remove the ``` and ```json if present
      if (generatedSections.includes('```')) {
        generatedSections = generatedSections.replace('```json', '').replace('```', '');
      }

      // parse the json
      try {
        generatedSections = JSON.parse(generatedSections);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        throw new Error('Failed to parse sections JSON');
      }
      
      // Save data to localStorage
      localStorage.setItem('tryTopic', topic);
      localStorage.setItem('tryTime', timeSelected.toString());
      localStorage.setItem('trySections', JSON.stringify(generatedSections));
      
      // Navigate to first section
      router.push('/try/1');
    } catch (error) {
      console.error('Error generating sections:', error);
      setIsLoading(false);
    }
  };

  const generateSectionContent = async (sectionNumber: number, sectionList: any[] = sections) => {
    if (!topic || !timeSelected) return;
    
    setIsLoading(true);
    
    try {
      const section = sectionList[sectionNumber - 1];
      const previousSections = sectionList
        .slice(0, sectionNumber - 1)
        .map(s => `${s.number}. ${s.title}`)
        .join(', ');
      
      const prompt = LEARNING_PROMPTS.SECTION_CONTENT
        .replace('{{TOPIC}}', topic)
        .replace('{{SECTION_TITLE}}', section.title)
        .replace('{{SECTION_NUMBER}}', section.number.toString())
        .replace('{{TOTAL_SECTIONS}}', sectionList.length.toString())
        .replace('{{TIME_PER_SECTION}}', (timeSelected / sectionList.length).toString())
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
      
      setResponse(generatedContent);
      setIsLoading(false);
      
      // Wait for content to be set before playing audio
      setTimeout(() => {
        playAudio(generatedContent);
      }, 100);
    } catch (error) {
      console.error('Error generating content:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !timeSelected) return;
    
    await generateSections();
  };

  const handleNextSection = () => {
    if (currentSection && currentSection.number < sections.length) {
      const nextSection = sections[currentSection.number];
      setCurrentSection(nextSection);
      generateSectionContent(nextSection.number);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection && currentSection.number > 1) {
      const prevSection = sections[currentSection.number - 2];
      setCurrentSection(prevSection);
      generateSectionContent(prevSection.number);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gradient-to-b from-white to-gray-100">
        <Header />
        <div className="max-w-xl mx-auto px-6 py-12">
          {showInput ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
                  Ask me anything
                </label>
                <textarea
                  id="input"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-black resize-none text-3xl"
                  placeholder={placeholder}
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-full grid grid-cols-5 gap-2">
                    {TIME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => !option.disabled && setTimeSelected(option.value)}
                        className={`px-2 py-3 rounded-lg border transition-colors ${
                          timeSelected === option.value
                            ? 'bg-gray-300 text-gray-800 border-gray-400'
                            : option.disabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isLoading || !topic || !timeSelected}
                    className={`w-full px-8 py-3 text-white rounded-lg transition-all duration-300 ${
                      isLoading || !topic || !timeSelected
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-br from-gray-700 via-black to-gray-600 hover:bg-[length:400%_400%] hover:animate-gradient-x'
                    }`}
                  >
                    {isLoading ? 'Thinking...' : 'Learn'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
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
                        <p className="text-gray-700 whitespace-pre-line">{response}</p>
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
                          onClick={() => playAudio(response)}
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
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 
'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LEARNING_PROMPTS } from '@/constants/prompts';
import { getTimeConfig } from '@/constants/config';
import Header from '@/components/Header';

export default function LearnSection() {
  const [content, setContent] = useState<string>('');
  const [sections, setSections] = useState<any[]>([]);
  const [currentSection, setCurrentSection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [topic, setTopic] = useState('');
  const [timeConfig, setTimeConfig] = useState<{
    totalMinutes: number;
    sections: number;
    timePerSection: number;
  } | null>(null);
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
      };
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        // Automatically go to next section if available
        if (sections.length > 0 && sectionId < sections.length) {
          router.push(`/learn/${sectionId + 1}`);
        }
      };
      
      audioRef.current.onerror = () => {
        console.error('Audio error occurred');
        setIsPlaying(false);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Add this function near the top of the component
  const clearLearningData = () => {
    // Clear all learning-related localStorage items
    localStorage.removeItem('learningTopic');
    localStorage.removeItem('learningTime');
    localStorage.removeItem('learningSections');
    
    // Clear all section content
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('learningContent_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };
  
  // Update the useEffect that loads data
  useEffect(() => {
    const savedTopic = localStorage.getItem('learningTopic');
    const savedTimeStr = localStorage.getItem('learningTime');
    
    if (!savedTopic || !savedTimeStr) {
      router.push('/');
      return;
    }

    const totalMinutes = parseInt(savedTimeStr);
    const config = getTimeConfig(totalMinutes);
    
    if (!config) {
      router.push('/');
      return;
    }

    // Only clear data if we're on section 1
    if (sectionId === 1) {
      clearLearningData();
      // Set the data again after clearing
      localStorage.setItem('learningTopic', savedTopic);
      localStorage.setItem('learningTime', savedTimeStr);
    }

    setTopic(savedTopic);
    const timePerSection = config.totalMinutes / config.sections;
    
    setTimeConfig({
      totalMinutes: config.totalMinutes,
      sections: config.sections,
      timePerSection
    });

    // Try to load sections from localStorage first
    const savedSections = localStorage.getItem('learningSections');
    if (savedSections) {
      const parsedSections = JSON.parse(savedSections);
      setSections(parsedSections);
      
      if (sectionId > 0 && sectionId <= parsedSections.length) {
        setCurrentSection(parsedSections[sectionId - 1]);
        loadSectionContent(savedTopic, parsedSections, sectionId, timePerSection);
      } else {
        router.push('/learn/1');
      }
    } else {
      // Generate sections if not available
      generateSections(savedTopic, config.totalMinutes, config.sections, timePerSection);
    }
  }, [sectionId, router]); // Add router to dependencies
  
  // Generate sections for the topic
  const generateSections = async (
    topic: string, 
    totalMinutes: number, 
    sectionsCount: number, 
    timePerSection: number
  ) => {
    setIsLoading(true);
    
    try {
      const prompt = LEARNING_PROMPTS.TOPIC_SPLITTER
        .replace('{{TOPIC}}', topic)
        .replace('{{TIME}}', totalMinutes.toString())
        .replace('{{SECTIONS_COUNT}}', sectionsCount.toString())
        .replace('{{TIME_PER_SECTION}}', timePerSection.toString());
      
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

      // Save sections to localStorage
      localStorage.setItem('learningSections', JSON.stringify(generatedSections));
      
      setSections(generatedSections);
      
      // Set current section and load content
      if (sectionId > 0 && sectionId <= generatedSections.length) {
        setCurrentSection(generatedSections[sectionId - 1]);
        await loadSectionContent(topic, generatedSections, sectionId, timePerSection);
      } else {
        router.push('/learn/1');
      }
    } catch (error) {
      console.error('Error generating sections:', error);
      setIsLoading(false);
    }
  };
  
  // Add a new function to preload section content
  const preloadSectionContent = async (
    topic: string,
    allSections: any[],
    sectionNumber: number,
    timePerSection: number
  ) => {
    if (sectionNumber < 1 || sectionNumber > allSections.length) return;

    const contentKey = `learningContent_${topic}_${sectionNumber}`;
    const savedContent = localStorage.getItem(contentKey);
    
    if (savedContent) return; // Already loaded

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
      
      // Save content to localStorage
      localStorage.setItem(contentKey, generatedContent);
    } catch (error) {
      console.error('Error preloading section content:', error);
    }
  };
  
  // Update the loadSectionContent function to trigger preloading
  const loadSectionContent = async (
    topic: string, 
    allSections: any[], 
    sectionNumber: number,
    timePerSection: number
  ) => {
    setIsLoading(true);
    
    try {
      const section = allSections[sectionNumber - 1];
      
      // Get previous sections titles to provide context
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
      
      // Check if content exists in localStorage
      const contentKey = `learningContent_${topic}_${sectionNumber}`;
      const savedContent = localStorage.getItem(contentKey);
      
      if (savedContent) {
        setContent(savedContent);
        setIsLoading(false);
        // Wait for content to be set before playing audio
        setTimeout(() => {
          playSectionAudio(savedContent);
        }, 100);
      } else {
        // Generate new content
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
        
        // Save content to localStorage
        localStorage.setItem(contentKey, generatedContent);
        
        setContent(generatedContent);
        setIsLoading(false);
        // Wait for content to be set before playing audio
        setTimeout(() => {
          playSectionAudio(generatedContent);
        }, 100);
      }

      // Preload adjacent sections
      if (sectionNumber > 1) {
        preloadSectionContent(topic, allSections, sectionNumber - 1, timePerSection);
      }
      if (sectionNumber < allSections.length) {
        preloadSectionContent(topic, allSections, sectionNumber + 1, timePerSection);
      }
    } catch (error) {
      console.error('Error loading section content:', error);
      setIsLoading(false);
    }
  };
  
  // Play audio for the section content
  const playSectionAudio = (text: string) => {
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
  
  const replayAudio = () => {
    if (!audioRef.current) return;
    
    setIsAudioLoading(true);
    
    audioRef.current.currentTime = 0;
    audioRef.current.play()
      .then(() => {
        setIsAudioLoading(false);
      })
      .catch(err => {
        console.error('Failed to replay audio:', err);
        setIsAudioLoading(false);
      });
  };
  
  // Update the navigateToSection function to preload content before navigation
  const navigateToSection = async (sectionNumber: number) => {
    if (sectionNumber > 0 && sectionNumber <= sections.length) {
      // Preload the target section's content if not already loaded
      if (topic && timeConfig) {
        await preloadSectionContent(topic, sections, sectionNumber, timeConfig.timePerSection);
      }
      router.push(`/learn/${sectionNumber}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Header />
      <div className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg">Preparing your learning content...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-blue-800">
                  {topic}
                </h1>
                <div className="mt-2 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
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
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="whitespace-pre-line text-black">{content}</p>
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
                      onClick={replayAudio}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
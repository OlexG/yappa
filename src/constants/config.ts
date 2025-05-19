interface TimeConfig {
  displayName: string;
  totalMinutes: number;
  sections: number;
}

interface AppConfig {
  timeOptions: TimeConfig[];
  voiceOptions: {
    id: string;
    name: string;
  }[];
}

export const APP_CONFIG: AppConfig = {
  // Time options available on the home page
  timeOptions: [
    {
      displayName: '5 minutes',
      totalMinutes: 5,
      sections: 5 // 5 sections of 1 minute each
    },
    {
      displayName: '1 hour',
      totalMinutes: 60,
      sections: 10 // 10 sections of 6 minutes each
    },
    {
      displayName: '10 hours',
      totalMinutes: 600,
      sections: 20 // 20 sections of 30 minutes each
    }
  ],
  
  // Voice options for the TTS API
  voiceOptions: [
    { id: 'alloy', name: 'Alloy' },
    { id: 'echo', name: 'Echo' },
    { id: 'fable', name: 'Fable' },
    { id: 'onyx', name: 'Onyx' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' }
  ]
};

// Helper function to get time config by minutes
export function getTimeConfig(minutes: number): TimeConfig | undefined {
  return APP_CONFIG.timeOptions.find(config => config.totalMinutes === minutes);
} 
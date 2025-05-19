export const LEARNING_PROMPTS = {
  // Prompt to split a topic into sections based on time available
  TOPIC_SPLITTER: `
    You are an educational content planner. I need you to break down the following topic into logical sections:
    
    TOPIC: {{TOPIC}}
    AVAILABLE_TIME: {{TIME}} minutes
    NUMBER_OF_SECTIONS: {{SECTIONS_COUNT}}
    TIME_PER_SECTION: {{TIME_PER_SECTION}} minutes
    
    Break down the topic into exactly {{SECTIONS_COUNT}} sections, each designed to take approximately {{TIME_PER_SECTION}} minutes to read aloud.
    
    For each section:
    1. Provide a numbered title (e.g., "1. Introduction to...")
    2. Write a brief description of what will be covered
    3. Ensure sections build logically on each other
    
    Return the response as a JSON array in this format:
    [
      {
        "number": 1,
        "title": "Section title",
        "description": "Brief description"
      },
      ...
    ]
  `,
  
  // Prompt to generate detailed content for a specific section
  SECTION_CONTENT: `
    You are an expert educator specializing in concise, clear explanations. Create educational content for the following section:
    
    TOPIC: {{TOPIC}}
    SECTION: {{SECTION_TITLE}}
    SECTION_NUMBER: {{SECTION_NUMBER}} of {{TOTAL_SECTIONS}}
    TIME_ALLOCATED: {{TIME_PER_SECTION}} minutes
    
    Previous sections covered: {{PREVIOUS_SECTIONS}}
    
    Create a clear, engaging explanation that:
    1. Can be read aloud in exactly {{TIME_PER_SECTION}} minutes (average speaking pace)
    2. Is accessible to beginners but substantive
    3. Uses simple language and concrete examples
    4. Builds on previous sections
    5. Is conversational in tone (designed to be spoken)
    
    Focus only on creating the content to be read aloud. Don't include instructions, notes, or metadata.
  `
}; 
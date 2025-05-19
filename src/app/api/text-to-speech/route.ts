import OpenAI from 'openai';
import { NextRequest } from 'next/server';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAIKEY,
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const text = url.searchParams.get('text');
  const voice = url.searchParams.get('voice') || 'alloy'; // Default to 'alloy' if not specified

  if (!text) {
    return new Response('Text parameter is required', { status: 400 });
  }

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
    });

    // Return streaming response with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return new Response(JSON.stringify({ error: 'Failed to convert text to speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Maintain the POST endpoint for backward compatibility
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, voice = 'alloy' } = body;

  if (!text) {
    return new Response(JSON.stringify({ error: 'Text is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
    });

    // Return streaming response with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache', 
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return new Response(JSON.stringify({ error: 'Failed to convert text to speech' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
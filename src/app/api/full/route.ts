/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { NextResponse } from 'next/server';
import { defaultContext } from "@/constants/context";

export async function POST(request: Request) {
  try {
    // Default session configuration parameters.
    const sessionConfig = {
      model: 'gpt-4o-realtime-preview',
      modalities: ['audio', 'text'],
      instructions: defaultContext.content
    };

    console.log('Session configuration:', sessionConfig);

    // Make a POST request to OpenAI's Realtime API session endpoint.
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAIKEY}`, // Ensure your API key is set in your environment variables
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating session:', errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log('Session created successfully:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';

// Instantiate the Google TTS client
const client = new TextToSpeechClient();

/**
 * Synthesizes speech from text input.
 * @param text The text to synthesize.
 * @returns A Buffer containing the MP3 audio.
 */
async function synthesize(text: string): Promise<Buffer> {
  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: { languageCode: 'en-US', name: 'en-US-Neural2-D' },
    audioConfig: {
      audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
    },
  };
  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent as Buffer;
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text');
  if (!text) {
    return new NextResponse('Text parameter is required', { status: 400 });
  }
  try {
    const audioContent = await synthesize(text);
    return new NextResponse(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('TTS GET error:', err);
    return NextResponse.json(
      { error: 'TTS synthesis failed' },
      { status: 500 }
    );
  }
}

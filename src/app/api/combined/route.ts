/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { defaultContext } from "@/constants/context";

export async function POST(request: Request) {
  const formData = await request.formData();
  const blob = formData.get("file") as Blob;
  if (!blob) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }


  const arrayBuffer = await blob.arrayBuffer();
  const fileForOpenAI = new File([arrayBuffer], "recording.webm", { type: "audio/webm" });

  // Retrieve conversation history (if provided) from form data
  let conversationMessages = [];
  const conversationField = formData.get("conversation");
  if (conversationField) {
    try {
      conversationMessages = JSON.parse(conversationField.toString());
      if (!Array.isArray(conversationMessages)) {
        conversationMessages = [];
      }
    } catch {
      conversationMessages = [];
    }
  }

  // Ensure a system prompt is at the beginning of the conversation history
  if (!conversationMessages.length || conversationMessages[0].role !== "system") {
    conversationMessages.unshift({
      role: "system",
      content: defaultContext.content,
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAIKEY,
  });

  try {
    // Get transcription from Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: "whisper-1",
    });

    // Append the new transcription as a user message to the conversation history
    conversationMessages.push({
      role: "user",
      content: transcriptionResponse.text,
    });

    // Use the full conversation as context for the Chat API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: conversationMessages,
    });

    const reply = chatResponse.choices[0]?.message?.content || "No reply available.";


    // Generate speech from the reply using ElevenLabs API
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    const elevenlabsVoiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Default voice ID if not specified

    // Prepare the request to ElevenLabs TTS API
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenlabsApiKey,
        } as any,
        body: JSON.stringify({
          text: reply,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      throw new Error(`ElevenLabs API error: ${ttsResponse.statusText}`);
    }

    // Get the audio data as ArrayBuffer
    const audioData = await ttsResponse.arrayBuffer();
    // Convert to base64 for sending to the client
    const audioBase64 = Buffer.from(audioData).toString("base64");
    // Return both the transcript and the reply (and optionally the updated conversation)
    return NextResponse.json({
      transcript: transcriptionResponse.text,
      reply,
      conversation: conversationMessages,
      audio: audioBase64
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}

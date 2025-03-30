// app/api/combined/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { defaultContext } from "@/constants/context";

export async function POST(request: Request) {
  const formData = await request.formData();
  const blob = formData.get("file") as Blob;
  if (!blob) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Convert the Blob to a File (requires Node v18+)
  const arrayBuffer = await blob.arrayBuffer();
  const fileForOpenAI = new File([arrayBuffer], "recording.webm", { type: "audio/webm" });

  const openai = new OpenAI({
    apiKey: process.env.OPENAIKEY,
  });

  try {
    // Get transcription from Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fileForOpenAI,
      model: "whisper-1",
    });

    // Use the transcript as input for the Chat API
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: defaultContext.content,
        },
        {
          role: "user",
          content: transcriptionResponse.text,
        },
      ],
    });

    const reply = chatResponse.choices[0]?.message?.content || "No reply available.";

    // Return both the transcript and the reply
    return NextResponse.json({ transcript: transcriptionResponse.text, reply });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { defaultContext } from "@/constants/context";

export async function POST(request: Request) {
  const body = await request.json();
  // Expecting { messages: Array<{role: string, content: string}> }
  const { messages } = body;

  // Optionally, prepend a default system message if not already present
  const conversation = messages[0]?.role === "system" 
    ? messages 
    : [defaultContext, ...messages];

  const openai = new OpenAI({
    apiKey: process.env.OPENAIKEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or your chosen model
      messages: conversation,
    });
    // Assuming the API returns an array of choices, we take the first one.
    const reply = completion.choices[0].message.content;
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return NextResponse.json(
      { error: "Error generating response" },
      { status: 500 }
    );
  }
}

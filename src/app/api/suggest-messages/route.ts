import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Create a streamed completion using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: "You are a helpful assistant.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      stream: true,
    });

    // Read the streamed response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    // Return the stream as a response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });
  } catch (error: any) {
    if (error.status) {
      // Handle OpenAI API errors
      return NextResponse.json(
        {
          error: error.message,
          status: error.status,
        },
        { status: error.status }
      );
    } else {
      // Handle unexpected errors
      console.error('An unexpected error occurred:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred.' },
        { status: 500 }
      );
    }
  }
}

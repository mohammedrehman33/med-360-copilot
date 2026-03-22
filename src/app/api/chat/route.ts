import { NextRequest } from 'next/server';
import { callClaude, AGENT_MODEL } from '@/lib/agents/claude-client';

const MEDICAL_COPILOT_SYSTEM = `You are PharmaAI Copilot, a compassionate and knowledgeable medical health assistant. You help patients understand their symptoms, medications, lab results, and general health questions.

Guidelines:
- Be warm, empathetic, and professional
- Provide evidence-based health information
- Always remind users you are an AI and not a substitute for professional medical advice
- For emergencies, immediately advise calling emergency services (911/1122 in Pakistan)
- When discussing medications, mention common side effects and interactions when relevant
- Use simple, patient-friendly language while being medically accurate
- If unsure, say so honestly rather than guessing
- Ask follow-up questions to better understand the patient's situation
- Never diagnose — you can discuss possible conditions but always recommend seeing a healthcare professional
- Keep responses concise (2-4 short paragraphs max) unless the user asks for detail
- Use bullet points for lists of symptoms, medications, or recommendations`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Build a single prompt from the conversation history so that callClaude
    // (which accepts a single prompt string) can handle multi-turn context.
    const conversationPrompt = messages
      .map((m: { role: string; content: string }) => {
        const label = m.role === 'assistant' ? 'Assistant' : 'User';
        return `${label}: ${m.content}`;
      })
      .join('\n\n');

    const fullText = await callClaude({
      system: MEDICAL_COPILOT_SYSTEM,
      prompt: conversationPrompt,
      model: AGENT_MODEL,
      maxTokens: 2048,
    });

    // Stream word-by-word for a typing effect
    const encoder = new TextEncoder();
    const words = fullText.split(/(\s+)/);

    const readable = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(word));
          await new Promise((resolve) => setTimeout(resolve, 15));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[API /chat] Error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    );
  }
}

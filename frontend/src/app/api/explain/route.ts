import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const model = "gemini-3-flash";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured in Vercel' },
        { status: 500 }
      );
    }

    const { termNameEn, termNameAr, category, definitionEn, lang, style } = await request.json();

    const systemPrompt = `You are a logistics domain expert. Your task is to explain the provided logistics term.
Language: The explanation MUST be in ${lang === 'ar' ? 'Arabic' : 'English'}.
Style: ${style}
- formal / academic → professional, precise, suitable for official documents
- simplified → clear language for someone new to the field
- colloquial / storytelling → conversational, friendly, and uses examples
Return ONLY the explanation text. No intro, no outro, no markdown.`;

    const userPrompt = `Term: ${termNameEn} (${termNameAr})
Category: ${category}
Base definition: ${definitionEn}
Explain this term.`;

    const geminiPayload = {
      contents: [{
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    };

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      return NextResponse.json({ error: 'AI Service Error' }, { status: 502 });
    }

    const data = await response.json();
    const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No explanation generated.';

    return NextResponse.json({ explanation: explanation.trim() });
  } catch (error) {
    console.error('Explain API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

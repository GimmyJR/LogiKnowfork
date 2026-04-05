import { NextRequest, NextResponse } from 'next/server';



const SYSTEM_PROMPT = `You are MANAR AI Assistant (منار), a specialized logistics and supply chain knowledge assistant for the MANAR educational platform.

Your expertise covers:
- Logistics terminology (Incoterms, FOB, CIF, CFR, EXW, etc.)
- Maritime trade and shipping
- Supply chain management
- Port operations and management
- Freight forwarding
- Customs and trade compliance
- Warehousing and distribution
- Transportation modes (sea, air, road, rail)
- International trade documentation (Bill of Lading, Letter of Credit, etc.)

Guidelines:
- Be concise, accurate, and educational
- When explaining terms, provide practical real-world examples
- Support Arabic (عربي), English, and French responses based on the user's language
- If asked about topics outside logistics/supply chain, politely redirect to your area of expertise
- Use a friendly, professional tone suitable for students and professionals
- Format responses with clear structure when explaining complex concepts`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  // Read env vars inside the handler so Vercel always resolves them at runtime
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, locale } = body as { messages: ChatMessage[]; locale: string };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Build Gemini-compatible content array
    const contents = [];

    // Add system instruction context
    const languageHint = locale === 'ar' ? 'Respond in Arabic.' : locale === 'fr' ? 'Respond in French.' : 'Respond in English.';

    // Add conversation history
    let lastRole = '';
    for (const msg of messages) {
      const role = msg.role === 'assistant' ? 'model' : 'user';
      
      // Gemini requires alternating roles and usually starting with user.
      if (contents.length === 0 && role === 'model') {
         continue; // Skip leading model messages to prevent API errors
      }
      
      // Prevent consecutive same-role messages by combining them or skipping
      if (role === lastRole) {
         contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
      } else {
         contents.push({
           role,
           parts: [{ text: msg.content }],
         });
         lastRole = role;
      }
    }

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${languageHint}` }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 1024,
      },
    };

    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('Gemini API error:', errorData);
      // Return actual Gemini error for debugging — remove this after fixing
      let parsedError: any = errorData;
      try { parsedError = JSON.parse(errorData); } catch {}
      return NextResponse.json(
        { 
          error: 'Gemini API error',
          status: geminiResponse.status,
          detail: parsedError?.error?.message || parsedError?.error || errorData
        },
        { status: 502 }
      );
    }

    const data = await geminiResponse.json();
    
    // Check for safety blocks or empty candidates
    if (!data.candidates || data.candidates.length === 0) {
      console.warn('Gemini returned no candidates. Possible safety block.', data);
      return NextResponse.json({ reply: 'I am unable to provide a response to that query due to content safety guidelines or an API error.' });
    }

    const reply =
      data.candidates[0]?.content?.parts?.[0]?.text || 'I could not generate a response. Please try again.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Provide a graceful fallback message if the connection to Gemini is blocked (e.g. timeout in certain regions)
    if (error?.code === 'UND_ERR_CONNECT_TIMEOUT' || error?.message?.includes('fetch failed')) {
      return NextResponse.json({ 
        reply: "I'm having trouble connecting to my AI servers. This is usually caused by network restrictions or a required VPN. Please check your connection to Google services and try again." 
      });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

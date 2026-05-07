import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    // Fetch vehicle catalog from backend to use as context
    let vehicleContext = "";
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const catalogRes = await fetch(`${backendUrl}/vehicles/?skip=0&limit=30`, {
        next: { revalidate: 3600 } // Cache for 1 hour to stay fast
      });
      if (catalogRes.ok) {
        const vehicles = await catalogRes.json();
        const formatted = vehicles.map((v: any) => 
          `- ${v.model_name} (${v.manufacturing_year}): Engine ${v.engine_size}L, Price ${v.minimum_price}-${v.max_price}M LKR, Efficiency ${v.fuel_efficiency_combined}L/100km. Desc: ${v.description}`
        ).join("\n");
        vehicleContext = `\n\nHere is data from our AutoFyx database. Use this to answer the user's questions:\n${formatted}`;
      }
    } catch (e) {
      console.error("Failed to fetch vehicle context:", e);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: `You are AutoFyx Assistant, a helpful and expert AI assistant for a smart vehicle recommendation platform called AutoFyx. You help users find cars, explain car metrics, maintenance costs, and help them navigate the platform. Keep your answers concise and friendly.${vehicleContext}` 
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return NextResponse.json({ error: 'Failed to communicate with Groq API' }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

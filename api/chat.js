// Vercel serverless function — DeepSeek AI fragrance chat
// Uses streaming via edge runtime

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message, context } = await request.json();

    const systemPrompt = `You are a friendly fragrance expert called "Scenty" in the Fragrance Compass app.

Current context for the user:
- Weather: ${context?.weather || 'Unknown'}
- Temperature: ${context?.temp || 'Unknown'}°F
- Time of day: ${context?.timeOfDay || 'Unknown'}
- Season: ${context?.season || 'Unknown'}
- Their fragrance collection: ${context?.collection || 'No fragrances yet'}

Help the user choose what to wear, answer questions about fragrances, give recommendations based on their collection and the current conditions, or just chat about scents. Be conversational, knowledgeable, and concise. Keep responses to 3-4 sentences unless they ask for more detail.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `API error: ${response.status} — ${errorText}` }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Stream the response back
    const { readable, writable } = new TransformStream();
    response.body.pipeTo(writable);

    return new Response(readable, { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}

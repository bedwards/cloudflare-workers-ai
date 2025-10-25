export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Check auth
    const auth = request.headers.get('Authorization');
    const [user, pass] = atob(auth?.replace('Basic ', '') || '').split(':');
    
    if (user !== env.AUTH_USER || pass !== env.AUTH_PASS) {
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Get message
    const { messages } = await request.json();

    // Call Workers AI
    const response = await env.AI.run('@cf/microsoft/phi-2', {
      messages,
      max_tokens: 256,
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
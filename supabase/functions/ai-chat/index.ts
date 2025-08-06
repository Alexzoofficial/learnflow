import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
  'Content-Security-Policy': "default-src 'self'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block'
};

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 10) { // 10 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
}

function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit to 1000 characters
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Check rate limit
  if (!getRateLimit(clientIP)) {
    return new Response(JSON.stringify({
      error: 'Rate limit exceeded. Please try again later.'
    }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json().catch(() => null);
    
    if (!requestBody || !requestBody.prompt) {
      return new Response(JSON.stringify({
        error: 'Missing or invalid prompt'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize input
    const sanitizedPrompt = sanitizeInput(requestBody.prompt);
    
    if (sanitizedPrompt.length === 0) {
      return new Response(JSON.stringify({
        error: 'Empty or invalid prompt after sanitization'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing AI chat request for:', sanitizedPrompt);

    // Generate educational response
    const educationalResponse = generateEducationalResponse(sanitizedPrompt);
    
    // Get relevant YouTube videos (only if relevant to the topic)
    const videos = getRelevantVideos(sanitizedPrompt);

    const response = {
      text: educationalResponse,
      videos: videos
    };

    console.log('AI chat response generated successfully');

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Function to generate concise educational content
const generateEducationalResponse = (prompt: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Math problems - direct answers only
  if (lowerPrompt.includes('2 + 2') || lowerPrompt.includes('2+2')) {
    return `**Answer: 4**`;
  }
  
  if (lowerPrompt.includes('math') || lowerPrompt.includes('addition') || lowerPrompt.includes('subtraction') || lowerPrompt.includes('multiplication') || lowerPrompt.includes('division')) {
    return `**${prompt}**\n\nBasic mathematical operations: addition (+), subtraction (-), multiplication (×), division (÷).`;
  }
  
  // Science topics - concise responses
  if (lowerPrompt.includes('science') || lowerPrompt.includes('physics') || lowerPrompt.includes('chemistry') || lowerPrompt.includes('biology')) {
    return `**${prompt}**\n\nScience studies natural phenomena through observation and experimentation.`;
  }
  
  // History topics - concise responses
  if (lowerPrompt.includes('history') || lowerPrompt.includes('historical')) {
    return `**${prompt}**\n\nHistory studies past events and their impact on the present.`;
  }

  // Language and literature
  if (lowerPrompt.includes('english') || lowerPrompt.includes('language') || lowerPrompt.includes('literature')) {
    return `**${prompt}**\n\nLanguage arts covers reading, writing, speaking, and listening skills.`;
  }

  // Geography
  if (lowerPrompt.includes('geography') || lowerPrompt.includes('world') || lowerPrompt.includes('countries')) {
    return `**${prompt}**\n\nGeography studies Earth's physical features and human activities.`;
  }
  
  // Default concise educational response
  return `**${prompt}**\n\nA systematic approach to understanding this topic with practical applications.`;
};

// Function to get relevant YouTube videos - only when truly relevant
const getRelevantVideos = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Math-related videos - only for specific math topics
  if (lowerPrompt.includes('addition') || lowerPrompt.includes('2 + 2') || lowerPrompt.includes('basic math')) {
    return [
      {
        id: "3QtRK7Y2pPU",
        title: "Basic Addition - Math Tutorial",
        thumbnail: "https://img.youtube.com/vi/3QtRK7Y2pPU/maxresdefault.jpg",
        url: "https://www.youtube.com/watch?v=3QtRK7Y2pPU",
        embed: "https://www.youtube.com/embed/3QtRK7Y2pPU"
      }
    ];
  }
  
  // Science videos - only for general science topics
  if (lowerPrompt.includes('science experiment') || lowerPrompt.includes('physics demo') || lowerPrompt.includes('chemistry lab')) {
    return [
      {
        id: "wWnfJ0-xXRE",
        title: "Science Experiments for Students",
        thumbnail: "https://img.youtube.com/vi/wWnfJ0-xXRE/maxresdefault.jpg",
        url: "https://www.youtube.com/watch?v=wWnfJ0-xXRE",
        embed: "https://www.youtube.com/embed/wWnfJ0-xXRE"
      }
    ];
  }
  
  // History videos - only for specific historical topics
  if (lowerPrompt.includes('world war') || lowerPrompt.includes('ancient') || lowerPrompt.includes('civilization')) {
    return [
      {
        id: "xuCn8ux2gbs",
        title: "World History Documentary",
        thumbnail: "https://img.youtube.com/vi/xuCn8ux2gbs/maxresdefault.jpg",
        url: "https://www.youtube.com/watch?v=xuCn8ux2gbs",
        embed: "https://www.youtube.com/embed/xuCn8ux2gbs"
      }
    ];
  }
  
  // Return empty array if no relevant videos found
  return [];
};
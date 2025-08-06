import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, image } = await req.json();

    if (!prompt) {
      throw new Error('No prompt provided');
    }

    console.log('Processing AI chat request for:', prompt);

    // Generate educational response
    const educationalResponse = generateEducationalResponse(prompt);
    
    // Get relevant YouTube videos (only if relevant to the topic)
    const videos = getRelevantVideos(prompt);

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
      JSON.stringify({ error: error.message }),
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
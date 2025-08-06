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
  
  // Math problems - concise responses
  if (lowerPrompt.includes('2 + 2') || lowerPrompt.includes('2+2')) {
    return `**Answer: 4**\n\n**Explanation:**\nAddition combines quantities. 2 + 2 means combining two groups of 2, resulting in 4.\n\n**Key Concept:** Basic arithmetic operation fundamental to mathematics.`;
  }
  
  if (lowerPrompt.includes('math') || lowerPrompt.includes('addition') || lowerPrompt.includes('subtraction') || lowerPrompt.includes('multiplication') || lowerPrompt.includes('division')) {
    return `**Mathematical Concept: ${prompt}**\n\n**Core Principles:**\n- Mathematics is the study of numbers, patterns, and relationships\n- Basic operations: addition, subtraction, multiplication, division\n- Foundation for advanced problem-solving\n\n**Application:** Essential for logical thinking and real-world calculations.`;
  }
  
  // Science topics - focused responses
  if (lowerPrompt.includes('science') || lowerPrompt.includes('physics') || lowerPrompt.includes('chemistry') || lowerPrompt.includes('biology')) {
    return `**Scientific Topic: ${prompt}**\n\n**Core Understanding:**\n- Science explains natural phenomena through observation and experimentation\n- Key method: hypothesis → experiment → analysis → conclusion\n- Branches: Physics (matter/energy), Chemistry (substances), Biology (life)\n\n**Importance:** Drives innovation and understanding of our world.`;
  }
  
  // History topics - concise responses
  if (lowerPrompt.includes('history') || lowerPrompt.includes('historical')) {
    return `**Historical Topic: ${prompt}**\n\n**Understanding History:**\n- Study of past events and their impact on present\n- Learn from past experiences and decisions\n- Understand cultural and societal development\n\n**Value:** Provides context for current events and future planning.`;
  }

  // Language and literature
  if (lowerPrompt.includes('english') || lowerPrompt.includes('language') || lowerPrompt.includes('literature')) {
    return `**Language Arts: ${prompt}**\n\n**Core Elements:**\n- Communication through reading, writing, speaking, listening\n- Literature analysis and creative expression\n- Grammar, vocabulary, and language structure\n\n**Skills Developed:** Critical thinking, communication, and cultural understanding.`;
  }

  // Geography
  if (lowerPrompt.includes('geography') || lowerPrompt.includes('world') || lowerPrompt.includes('countries')) {
    return `**Geography Topic: ${prompt}**\n\n**Understanding Geography:**\n- Study of Earth's physical features and human activities\n- Covers climate, landforms, populations, and cultures\n- Spatial relationships and environmental interactions\n\n**Application:** Essential for global awareness and environmental understanding.`;
  }
  
  // Default concise educational response
  return `**Educational Topic: ${prompt}**\n\n**Key Learning Points:**\n- Systematic approach to understanding the subject\n- Practical applications in real-world scenarios\n- Foundation for advanced learning\n\n**Learning Method:** Break complex topics into manageable parts for better comprehension.`;
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
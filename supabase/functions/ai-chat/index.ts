import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('Google Gemini API key not configured');
    }

    let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    let requestBody: any = {
      contents: [{
        parts: []
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Add text prompt
    if (prompt) {
      requestBody.contents[0].parts.push({
        text: prompt
      });
    }

    // Add image if provided
    if (image) {
      // Remove data URL prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data
        }
      });
    }

    console.log('Sending request to Gemini API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;

    // Search for related YouTube videos
    const youtubeResults = await searchYouTubeVideos(prompt || "educational content");

    return new Response(
      JSON.stringify({ 
        text: generatedText,
        videos: youtubeResults 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function searchYouTubeVideos(query: string) {
  try {
    // Direct YouTube API search
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&key=AIzaSyDn9nD0GjNTaCgPBCHwVcHcmxFbj4qMcwk`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('YouTube API error:', await response.text());
      return [];
    }

    const data = await response.json();
    
    return data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embed: `https://www.youtube.com/embed/${item.id.videoId}`
    })) || [];
    
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, image, linkUrl } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required prompt parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize input
    const sanitizedPrompt = sanitizeInput(prompt, 500);
    
    if (sanitizedPrompt.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid prompt content" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL if provided
    let validatedUrl: string | undefined;
    if (linkUrl) {
      try {
        validatedUrl = validateUrl(linkUrl);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: "Invalid URL provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate image if provided
    let validatedImage: string | undefined;
    if (image) {
      try {
        validatedImage = validateBase64Image(image);
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : "Invalid image data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Call AI
    const aiResponse = await generateAIResponse(sanitizedPrompt, validatedImage, validatedUrl);
    const videos = getRelevantVideos(sanitizedPrompt);

    return new Response(
      JSON.stringify({ text: aiResponse, videos }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AI Chat Error]", error instanceof Error ? error.message : "Unknown error");
    
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function sanitizeInput(input: string, maxLength: number = 500): string {
  if (typeof input !== "string") {
    throw new Error("Invalid input type");
  }
  
  if (input.length > maxLength * 2) {
    throw new Error("Input too long");
  }
  
  const truncated = input.slice(0, maxLength);
  
  return truncated
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

function validateUrl(urlString: string): string {
  const url = new URL(urlString);
  
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Invalid protocol");
  }
  
  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.startsWith("127.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    hostname === "169.254.169.254"
  ) {
    throw new Error("Private IP addresses not allowed");
  }
  
  if (url.href.length > 2048) {
    throw new Error("URL too long");
  }
  
  return url.href;
}

function validateBase64Image(base64String: string, maxSizeBytes: number = 10 * 1024 * 1024): string {
  if (!base64String || typeof base64String !== "string") {
    throw new Error("Invalid image data");
  }
  
  const base64Data = base64String.split(",")[1] || base64String;
  const sizeBytes = (base64Data.length * 3) / 4;
  
  if (sizeBytes > maxSizeBytes) {
    throw new Error(`Image too large. Max size: ${maxSizeBytes / 1024 / 1024}MB`);
  }
  
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data)) {
    throw new Error("Invalid base64 format");
  }
  
  return base64Data;
}

async function generateAIResponse(prompt: string, image?: string, linkUrl?: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (!LOVABLE_API_KEY) {
    throw new Error("AI service not configured");
  }

  const messages: any[] = [
    {
      role: "system",
      content: "You are an educational AI assistant for LearnFlow. Provide helpful, accurate, and concise answers suitable for students aged 3+. Use simple language and explain concepts clearly."
    },
    {
      role: "user",
      content: prompt
    }
  ];

  // Add image if provided
  if (image) {
    messages[1].content = [
      { type: "text", text: prompt + "\n\nPlease analyze the provided image and incorporate it into your response." },
      {
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image}` }
      }
    ];
  }

  // Add link context if provided
  if (linkUrl) {
    messages[1].content = typeof messages[1].content === "string" 
      ? messages[1].content + `\n\nAdditionally, consider this link: ${linkUrl}`
      : messages[1].content;
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limits exceeded, please try again later.");
    }
    if (response.status === 402) {
      throw new Error("AI service quota exceeded. Please contact support.");
    }
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
}

function getRelevantVideos(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("addition") || lowerPrompt.includes("2 + 2") || lowerPrompt.includes("basic math")) {
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
  
  if (lowerPrompt.includes("science") || lowerPrompt.includes("experiment")) {
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
  
  if (lowerPrompt.includes("history") || lowerPrompt.includes("world war")) {
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
  
  return [];
}

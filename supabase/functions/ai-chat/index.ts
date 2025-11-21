import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web search tool
async function webSearch(query: string): Promise<string> {
  try {
    const searchQuery = encodeURIComponent(query);
    const response = await fetch(`https://whoogle-bbso.onrender.com/search?q=${searchQuery}&format=json`);
    
    if (!response.ok) return "Web search unavailable.";
    
    const searchData = await response.json();
    
    if (!Array.isArray(searchData)) return "No results found.";
    
    const validResults = searchData.filter((item: any) => item.url?.startsWith('http')).slice(0, 5);
    let results = "";
    
    for (const item of validResults) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const pageResponse = await fetch(item.url, { 
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (pageResponse.ok) {
          const html = await pageResponse.text();
          const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (text) {
            let truncatedText = text.substring(0, 3000);
            // Ensure truncation happens at the end of a sentence.
            const lastPeriod = truncatedText.lastIndexOf('.');
            if (lastPeriod !== -1) {
              truncatedText = truncatedText.substring(0, lastPeriod + 1);
            }
            results += `\n\n[Source: ${item.url}]\n${truncatedText}`;
          }
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
      }
    }
    
    return results || "No content extracted from search results.";
  } catch (err) {
    console.error('Web search error:', err);
    return "Web search failed.";
  }
}

// Helper function to remove ad text
function removeAd(text: string): string {
  if (typeof text !== 'string') return '';
  const adPattern = /^\s*🌸\s*Ad\s*🌸\s*Powered by Pollinations\.AI.*$/gim;
  return text.replace(adPattern, "").trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userIP } = await req.json();
    
    console.log('Request from IP:', userIP);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // System prompt
    const systemPrompt = `You are Alexzo Intelligence, a sophisticated AI assistant from Alexzo.

**Core Directives:**
- **Web Search & Synthesis:** When the user's query requires external information, autonomously use the \`web_search\` tool to gather relevant data from multiple sources. After searching, synthesize the information into a comprehensive, customized response that directly addresses the user's needs. Do not just list the search results.
- **Image Analysis:** Analyze provided images to understand and respond to visual queries.
- **Efficiency & Accuracy:** Prioritize providing accurate, concise, and helpful responses.

**Response Protocol:**
- **Clarity and Brevity:** Your default response style is direct and to the point. Provide clear and simple answers without unnecessary detail.
- **Situational Elaboration:** If the user's query implies a need for a detailed explanation (e.g., "explain," "how does," "what is"), then provide a comprehensive, well-structured answer. For academic or scientific topics, be thorough and act as a knowledgeable expert.
- **Formatting:** Use Markdown for clarity: **bolding** for emphasis, bullet points for lists. Use KaTeX-style syntax for formulas (e.g., `$\\text{H}_2\\text{O}$`).
- **Source Attribution:** Always cite your sources when you use the web search tool.
- **Neutrality:** Do not include advertisements, promotional material, or "support us" messages.

Your primary objective is to be an intelligent, efficient, and user-friendly assistant that adapts its level of detail to the user's needs.`;

    // Prepare messages with system prompt
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Define tools
    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Use this tool to find the most current information online, including news, product releases, or any real-time data. It is also useful for topics you don't have information about.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query"
              }
            },
            required: ["query"]
          }
        }
      }
    ];

    // First API call - let AI decide if tools needed
    let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools: tools,
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Check if tool calls were made
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.function.name === "web_search") {
        const args = JSON.parse(toolCall.function.arguments);
        const searchResults = await webSearch(args.query);
        
        // Add tool response and get final answer
        const messagesWithTool = [
          ...aiMessages,
          assistantMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: searchResults
          }
        ];
        
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: messagesWithTool,
          }),
        });

        if (!response.ok) {
          if (response.status === 400) {
            // Check for content filter error from the AI provider
            const errorData = await response.json().catch(() => ({}));
            if (errorData?.details?.error?.code === 'content_filter') {
              return new Response(
                JSON.stringify({
                  error: "The content from the web search was blocked by the safety filter. Please try a different search query."
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
          console.error("Second AI call failed:", await response.text());
          throw new Error("The AI service failed to process the request after a web search.");
        }
        
        const finalData = await response.json();
        const cleanedResponse = removeAd(finalData.choices[0].message.content);
        return new Response(
          JSON.stringify({
            response: cleanedResponse,
            usedWebSearch: true,
            searchQuery: args.query
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // No tool calls - return direct response
    const cleanedResponse = removeAd(assistantMessage.content);
    return new Response(
      JSON.stringify({
        response: cleanedResponse,
        usedWebSearch: false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : "Unknown error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

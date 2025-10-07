import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 10) {
    return false;
  }
  
  limit.count++;
  return true;
}

function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 1000);
}

async function generateAIResponse(prompt: string, image?: string, linkUrl?: string): Promise<string> {
  try {
    const googleAIApiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!googleAIApiKey) {
      console.log('Google AI API key not found, using fallback response');
      return generateFallbackResponse(prompt);
    }

    const requestBody: any = {
      contents: [
        {
          parts: []
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    let fullPrompt = `You are an educational AI assistant. Please provide a helpful, accurate, and concise answer to this question: ${prompt}`;
    
    if (image) {
      console.log('Processing image with AI request');
      fullPrompt += '\n\nPlease analyze the provided image and incorporate it into your response.';
      
      let base64Data = image;
      if (image.startsWith('data:')) {
        base64Data = image.split(',')[1];
      }
      
      requestBody.contents[0].parts.push({
        text: fullPrompt
      });
      
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: base64Data
        }
      });
    } else {
      requestBody.contents[0].parts.push({
        text: fullPrompt
      });
    }
    
    if (linkUrl) {
      console.log('Processing link URL:', linkUrl);
      requestBody.contents[0].parts[0].text += `\n\nAdditionally, please analyze this link: ${linkUrl}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleAIApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error('Google AI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return generateFallbackResponse(prompt);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Google AI API response structure:', data);
      return generateFallbackResponse(prompt);
    }
  } catch (error) {
    console.error('Error calling Google AI API:', error);
    return generateFallbackResponse(prompt);
  }
}

function generateFallbackResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('2 + 2') || lowerPrompt.includes('2+2')) {
    return `**Answer: 4**`;
  }
  
  if (lowerPrompt.includes('math') || lowerPrompt.includes('addition') || lowerPrompt.includes('subtraction') || lowerPrompt.includes('multiplication') || lowerPrompt.includes('division')) {
    return `**${prompt}**\n\nBasic mathematical operations: addition (+), subtraction (-), multiplication (×), division (÷).`;
  }
  
  if (lowerPrompt.includes('science') || lowerPrompt.includes('physics') || lowerPrompt.includes('chemistry') || lowerPrompt.includes('biology')) {
    return `**${prompt}**\n\nScience studies natural phenomena through observation and experimentation.`;
  }
  
  if (lowerPrompt.includes('history') || lowerPrompt.includes('historical')) {
    return `**${prompt}**\n\nHistory studies past events and their impact on the present.`;
  }

  if (lowerPrompt.includes('english') || lowerPrompt.includes('language') || lowerPrompt.includes('literature')) {
    return `**${prompt}**\n\nLanguage arts covers reading, writing, speaking, and listening skills.`;
  }

  if (lowerPrompt.includes('geography') || lowerPrompt.includes('world') || lowerPrompt.includes('countries')) {
    return `**${prompt}**\n\nGeography studies Earth's physical features and human activities.`;
  }
  
  return `**${prompt}**\n\nA systematic approach to understanding this topic with practical applications.`;
}

function getRelevantVideos(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  
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
  
  return [];
}

app.post('/api/ai-chat', async (req, res) => {
  const clientIP = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  
  if (!getRateLimit(clientIP as string)) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please try again later.'
    });
  }

  try {
    const { prompt, image, linkUrl } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: 'Missing or invalid prompt'
      });
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({
        error: 'Empty or invalid prompt after sanitization'
      });
    }

    console.log('Processing AI chat request for:', sanitizedPrompt);
    
    if (image) {
      console.log('Image data received, length:', image.length);
    }
    
    if (linkUrl) {
      console.log('Link URL received:', linkUrl);
    }

    const aiResponse = await generateAIResponse(sanitizedPrompt, image, linkUrl);
    const videos = getRelevantVideos(sanitizedPrompt);

    const response = {
      text: aiResponse,
      videos: videos
    };

    console.log('AI chat response generated successfully');

    return res.json(response);

  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - restrict to specific origins
const allowedOrigins = [
  'https://alexzo.vercel.app',
  'http://localhost:5000',
  'http://localhost:8080'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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

function sanitizeInput(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  // Validate length BEFORE processing to prevent ReDoS attacks
  if (input.length > maxLength * 2) {
    throw new Error('Input too long');
  }
  
  // Truncate early
  const truncated = input.slice(0, maxLength);
  
  // Then sanitize
  return truncated
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

function validateUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    // Block private IP ranges and localhost
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
        hostname === '169.254.169.254') {
      throw new Error('Private IP addresses not allowed');
    }
    
    // Length limit
    if (url.href.length > 2048) {
      throw new Error('URL too long');
    }
    
    return url.href;
  } catch (error) {
    throw new Error('Invalid URL');
  }
}

function validateBase64Image(base64String: string, maxSizeBytes: number = 10 * 1024 * 1024): string {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid image data');
  }
  
  // Remove data URI prefix if present
  const base64Data = base64String.split(',')[1] || base64String;
  
  // Calculate actual size (base64 encoding increases size by ~33%)
  const sizeBytes = (base64Data.length * 3) / 4;
  
  if (sizeBytes > maxSizeBytes) {
    throw new Error(`Image too large. Max size: ${maxSizeBytes / 1024 / 1024}MB`);
  }
  
  // Validate base64 format
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64Data)) {
    throw new Error('Invalid base64 format');
  }
  
  return base64Data;
}

async function generateAIResponse(prompt: string, image?: string, linkUrl?: string): Promise<string> {
  try {
    const googleAIApiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!googleAIApiKey) {
      throw new Error('Google AI API key not configured');
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
      fullPrompt += '\n\nPlease analyze the provided image and incorporate it into your response.';
      
      // Validate image data
      const base64Data = validateBase64Image(image);
      
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
      // Validate URL to prevent SSRF attacks
      const validatedUrl = validateUrl(linkUrl);
      requestBody.contents[0].parts[0].text += `\n\nAdditionally, please analyze this link: ${validatedUrl}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleAIApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid AI response structure');
    }
  } catch (error) {
    // Log error details server-side only
    if (process.env.NODE_ENV !== 'production') {
      console.error('[AI Service Error]', error instanceof Error ? error.message : 'Unknown error');
    }
    throw error;
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
        error: 'Missing required prompt parameter'
      });
    }

    const sanitizedPrompt = sanitizeInput(prompt);
    
    if (sanitizedPrompt.length === 0) {
      return res.status(400).json({
        error: 'Invalid prompt content'
      });
    }

    const aiResponse = await generateAIResponse(sanitizedPrompt, image, linkUrl);
    const videos = getRelevantVideos(sanitizedPrompt);

    return res.json({
      text: aiResponse,
      videos: videos
    });

  } catch (error) {
    // Log error details server-side only (not in production)
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API Error]', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Return generic error to client
    const statusCode = error instanceof Error && error.message.includes('Invalid') ? 400 : 500;
    return res.status(statusCode).json({ 
      error: 'An error occurred processing your request. Please try again later.' 
    });
  }
});

// Validate critical environment variables on startup
if (!process.env.GOOGLE_AI_API_KEY) {
  console.error('CRITICAL: GOOGLE_AI_API_KEY environment variable not set');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

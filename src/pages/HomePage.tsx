import React, { useState } from 'react';
import { SubjectTabs } from '@/components/SubjectTabs';
import { QuestionInput } from '@/components/QuestionInput';
import { ResultCard } from '@/components/ResultCard';
import { FeatureCards } from '@/components/FeatureCards';
import { useToast } from '@/hooks/use-toast';
import { useRequestLimit } from '@/hooks/useRequestLimit';
import { RequestLimitBanner } from '@/components/RequestLimitBanner';
// Removed Google AI - using pollinations.ai instead

interface HomePageProps {
  user?: any;
  onShowAuth?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, onShowAuth }) => {
  const [activeSubject, setActiveSubject] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLimitReached, remainingRequests, incrementRequest } = useRequestLimit();

  const handleQuestionSubmit = async (question: string, image?: File, linkUrl?: string, includeRelatedSources: boolean = false) => {
    if (!question.trim() && !image) return;

    if (!user && isLimitReached) {
      toast({
        title: "Daily limit reached",
        description: "You've reached your daily limit of 5 requests. Please sign in for unlimited access.",
        variant: "destructive",
      });
      if (onShowAuth) {
        onShowAuth();
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Comprehensive system prompt for Alexzo Intelligence
      const systemPrompt = `You are Alexzo Intelligence, the revolutionary AI engine powering LearnFlow by Alexzo - a cutting-edge educational platform designed to transform learning through personalized, adaptive, and intelligent assistance.

CORE IDENTITY & VALUES:
- You represent Alexzo's commitment to pioneering AI-powered human enhancement in education
- You embody precision, clarity, and innovation in every response
- You are supportive, encouraging, and patient with all learners
- You never provide harmful, inappropriate, or offensive content
- You maintain the highest standards of academic integrity and accuracy

CAPABILITIES & EXPERTISE:
- Full K-12 through graduate-level education coverage
- Subjects: Mathematics, Science (Physics, Chemistry, Biology), History, Literature, Computer Science, Technology, Arts, Languages, Social Studies
- Multi-modal learning: Text, images, links, voice interactions
- Step-by-step problem solving with clear explanations
- Concept breakdown from fundamentals to advanced applications
- Real-world examples and practical applications
- Homework help, test preparation, research assistance
- Code analysis, debugging, and programming concepts
- Document and website content analysis

RESPONSE GUIDELINES:
- Keep responses CONCISE: 2-3 paragraphs maximum unless complexity demands more
- Start with direct answer, then explain reasoning
- Use clear, grade-appropriate language
- Break complex topics into digestible parts
- Provide step-by-step solutions for problems
- Include relevant examples and analogies
- Encourage critical thinking and deeper exploration
- When analyzing images: describe what you see, explain concepts shown, answer specific questions
- When analyzing links/websites: extract key information, summarize main points, provide insights
- Adapt your tone and complexity to the student's level

QUALITY STANDARDS:
- Accuracy is paramount - verify information mentally before responding
- Show your work for mathematical problems
- Cite reasoning for scientific explanations
- Provide context for historical and literary analysis
- Explain technical concepts with clarity
- Never guess - if uncertain, explain what you know and what would need verification

Remember: You're not just answering questions - you're fostering understanding, building confidence, and inspiring lifelong learning.`;

      // Fetch URL content if provided with enhanced extraction
      let urlContent = '';
      let relatedSources: string[] = [];
      
      if (linkUrl) {
        try {
          const urlResponse = await fetch(linkUrl);
          const html = await urlResponse.text();
          
          // Extract text content (strip HTML tags)
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          
          // Remove script, style, and navigation elements
          const unwantedElements = doc.querySelectorAll('script, style, nav, header, footer, aside');
          unwantedElements.forEach(el => el.remove());
          
          // Get main content
          const mainContent = doc.body?.textContent || '';
          urlContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 3000);
          
          // Extract related links if requested
          if (includeRelatedSources) {
            const links = Array.from(doc.querySelectorAll('a[href]'));
            const baseUrl = new URL(linkUrl);
            
            for (const link of links.slice(0, 5)) { // Limit to 5 related sources
              const href = link.getAttribute('href');
              if (href && (href.startsWith('http') || href.startsWith('/'))) {
                try {
                  const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
                  if (fullUrl.includes(baseUrl.hostname)) {
                    const relatedResponse = await fetch(fullUrl);
                    const relatedHtml = await relatedResponse.text();
                    const relatedDoc = parser.parseFromString(relatedHtml, 'text/html');
                    const relatedText = relatedDoc.body?.textContent?.replace(/\s+/g, ' ').trim().substring(0, 500);
                    if (relatedText) {
                      relatedSources.push(`[From ${fullUrl}]: ${relatedText}`);
                    }
                  }
                } catch (err) {
                  console.error('Failed to fetch related source:', err);
                }
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch URL:', err);
          urlContent = 'Unable to fetch content from the provided URL.';
        }
      }

      // Prepare messages for vision-capable model
      const messages: any[] = [];
      
      // Add system message
      messages.push({
        role: 'system',
        content: systemPrompt
      });

      // Build user message content
      let userMessageContent = `Subject Context: ${activeSubject}\n\nStudent Question: ${question}`;
      
      if (linkUrl && urlContent) {
        userMessageContent += `\n\nWebsite Content from ${linkUrl}:\n${urlContent}`;
        
        if (relatedSources.length > 0) {
          userMessageContent += `\n\nRelated Sources:\n${relatedSources.join('\n\n')}`;
        }
      }

      // Handle image if provided (use vision model with proper format)
      if (image) {
        const imageBase64 = await convertImageToBase64(image);
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: userMessageContent },
            { 
              type: 'image_url', 
              image_url: { url: imageBase64 }
            }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: userMessageContent
        });
      }

      // Use vision-capable model from pollinations.ai
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: 'openai',
          seed: Math.floor(Math.random() * 1000000),
          jsonMode: false
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const text = await response.text();
      setResult(text);

      if (!user) {
        incrementRequest();
      }
    } catch (err) {
      console.error("Full error object:", err);
      let errorMessage = "Request failed. ";
      
      if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += "Please check your internet connection and try again.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Request Limit Banner for unauthenticated users */}
      {!user && (
        <RequestLimitBanner 
          remainingRequests={remainingRequests}
          isLimitReached={isLimitReached}
          onShowAuth={onShowAuth || (() => {})}
        />
      )}
      
      {/* Subject Tabs - Mobile Optimized */}
      <div className="w-full">
        <SubjectTabs 
          activeSubject={activeSubject} 
          onSubjectChange={setActiveSubject} 
        />
      </div>
      
      {/* Question Input - Full Width Mobile */}
      <div className="w-full">
        <QuestionInput 
          onSubmit={handleQuestionSubmit} 
          isLoading={isLoading}
          disabled={!user && isLimitReached}
        />
      </div>
      
      {/* Result Card - Mobile Optimized */}
      <div className="w-full">
        <ResultCard 
          isLoading={isLoading} 
          result={result} 
          error={error} 
        />
      </div>
      
      {/* Feature Cards - Mobile Responsive Grid */}
      <div className="w-full">
        <FeatureCards />
      </div>
    </div>
  );
};
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
  const [sources, setSources] = useState<{url: string, domain: string}[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
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
    setSources([]);
    setIsSearchingWeb(false);
    setSearchQuery(null);

    // Get user IP
    let userIP = 'unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      userIP = ipData.ip;
      console.log('User IP tracked:', userIP);
    } catch (err) {
      console.error('IP tracking failed:', err);
    }

    try {
      // Enhanced system prompt for better responses
      const systemPrompt = `You are Alexzo Intelligence - an advanced AI learning assistant.

CORE CAPABILITIES:
- Automatically search the web when questions need current information, latest updates, or real-time data
- Analyze and understand images when provided
- Extract and reference content from provided URLs
- Provide accurate, comprehensive explanations

RESPONSE GUIDELINES:
- Give **direct, clear answers** with proper explanations
- Use **bold** for key concepts and important points
- Structure responses with bullet points for better readability
- Keep responses concise but thorough (aim for 6-10 sentences)
- Always cite sources when using web search
- For educational content, provide step-by-step explanations
- Include relevant examples when helpful

SUBJECT CONTEXT: ${activeSubject}
Be intelligent, efficient, and helpful. Prioritize clarity and accuracy.`;

      // Build user message
      let userMessage = question;
      
      // Fetch URL content if provided
      if (linkUrl) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const urlResponse = await fetch(linkUrl, { 
            signal: controller.signal,
            mode: 'cors'
          });
          clearTimeout(timeoutId);
          
          if (urlResponse.ok) {
            const html = await urlResponse.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const unwantedElements = doc.querySelectorAll('script, style, nav, header, footer, aside');
            unwantedElements.forEach(el => el.remove());
            
            const mainContent = doc.body?.textContent || '';
            const urlContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 1200);
            
            userMessage += `\n\nReference URL Content:\n${urlContent}`;
            
            const url = new URL(linkUrl);
            setSources([{
              url: linkUrl,
              domain: url.hostname.replace('www.', '')
            }]);
          }
        } catch (err) {
          console.error('Failed to fetch URL:', err);
        }
      }

      // Detect if web search is needed
      const searchKeywords = ['latest', 'current', 'recent', 'new', 'today', 'now', '2024', '2025', 'update', 'news'];
      const needsWebSearch = searchKeywords.some(keyword => question.toLowerCase().includes(keyword));
      
      if (needsWebSearch) {
        setIsSearchingWeb(true);
        setSearchQuery(question);
      }

      // Prepare messages for AI
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Handle image if provided
      if (image) {
        const imageBase64 = await convertImageToBase64(image);
        userMessage = `${userMessage}\n\n[Image provided for analysis]`;
        // Note: Pollinations.ai supports image analysis through base64
      }
      
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Perform web search if needed
      let searchContext = '';
      if (needsWebSearch) {
        try {
          const searchQuery = encodeURIComponent(question);
          const searchResponse = await fetch(`https://whoogle-bbso.onrender.com/search?q=${searchQuery}&format=json`);
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (Array.isArray(searchData)) {
              const validResults = searchData.filter((item: any) => item.url?.startsWith('http')).slice(0, 3);
              
              // Extract sources for display
              const sourcesArray = validResults.map((item: any) => {
                const url = new URL(item.url);
                return {
                  url: item.url,
                  domain: url.hostname.replace('www.', '')
                };
              });
              setSources(sourcesArray);
              
              // Fetch content from search results in parallel
              const contentPromises = validResults.map(async (item: any) => {
                try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 3000);
                  
                  const pageResponse = await fetch(item.url, { signal: controller.signal });
                  clearTimeout(timeoutId);
                  
                  if (pageResponse.ok) {
                    const html = await pageResponse.text();
                    const text = html
                      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim()
                      .substring(0, 600);
                    
                    return `[Source: ${item.url}]\n${text}`;
                  }
                } catch (err) {
                  console.error('Failed to fetch page:', err);
                }
                return '';
              });
              
              const contents = await Promise.all(contentPromises);
              searchContext = contents.filter(c => c).join('\n\n');
            }
          }
        } catch (err) {
          console.error('Web search failed:', err);
        }
      }

      // Add search context to messages if available
      if (searchContext) {
        messages.push({
          role: 'system',
          content: `Web Search Results:\n\n${searchContext}\n\nUse this information to provide an accurate, up-to-date answer. Always cite your sources.`
        });
      }

      // Call Pollinations.ai API (GPT-4 level model, free)
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: 'openai',
          seed: Math.floor(Math.random() * 1000000),
          jsonMode: false
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed with status ${response.status}`);
      }

      const aiResponse = await response.text();
      setResult(aiResponse);

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
      
      {/* Enhanced Processing UI */}
      {isLoading && (
        <div className="w-full p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-foreground mb-1">
                {isSearchingWeb ? '🌐 Searching the web...' : '💭 Processing your question...'}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSearchingWeb ? 'Finding latest information from the web' : 'AI is analyzing your request'}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full bg-primary/10 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/50 animate-[shimmer_2s_infinite]" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}
      
      {/* Enhanced Sources Display */}
      {isSearchingWeb && sources.length > 0 && isLoading && (
        <div className="w-full p-5 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border-2 border-accent/20">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span>Found sources for: <span className="text-primary font-bold">{searchQuery}</span></span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            {sources.map((site, idx) => (
              <a 
                key={idx} 
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 bg-background/80 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="relative">
                  <img 
                    src={`https://icons.duckduckgo.com/ip3/${site.domain}.ico`}
                    alt=""
                    className="w-5 h-5 rounded"
                    loading="eager"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes('google.com')) {
                        target.src = `https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`;
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                  <div className="absolute -inset-1 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-200"></div>
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{site.domain}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Result Card - Mobile Optimized */}
      <div className="w-full">
        <ResultCard 
          isLoading={isLoading} 
          result={result} 
          error={error}
          sources={sources}
        />
      </div>
      
      {/* Feature Cards - Mobile Responsive Grid */}
      <div className="w-full">
        <FeatureCards />
      </div>
    </div>
  );
};
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
      // Build user message content
      let userMessageContent = `Subject Context: ${activeSubject}\n\nStudent Question: ${question}`;
      
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
            
            userMessageContent += `\n\nWebsite Content from ${linkUrl}:\n${urlContent}`;
            
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

      // Prepare messages
      const messages: any[] = [];

      // Handle image if provided
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

      // Call edge function with AI
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ 
          messages,
          userIP 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Check if web search was used
      if (data.usedWebSearch) {
        setIsSearchingWeb(true);
        setSearchQuery(data.searchQuery || question);
        
        // Extract sources from search query
        try {
          const searchQueryEncoded = encodeURIComponent(data.searchQuery || question);
          const whoogleResponse = await fetch(`https://whoogle-bbso.onrender.com/search?q=${searchQueryEncoded}&format=json`);
          
          if (whoogleResponse.ok) {
            const searchData = await whoogleResponse.json();
            if (Array.isArray(searchData)) {
              const validResults = searchData.filter((item: any) => item.url?.startsWith('http')).slice(0, 3);
              const sourcesArray = validResults.map((item: any) => {
                const url = new URL(item.url);
                return {
                  url: item.url,
                  domain: url.hostname.replace('www.', '')
                };
              });
              setSources(sourcesArray);
            }
          }
        } catch (err) {
          console.error('Failed to extract sources:', err);
        }
      }
      
      setResult(data.response);

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
      
      {/* Web Search Status - Show during loading */}
      {isLoading && (
        <div className="w-full p-4 bg-muted/50 rounded-lg border border-border animate-pulse">
          <p className="text-sm font-medium mb-2">🔍 Processing your request...</p>
          <p className="text-xs text-muted-foreground">AI is analyzing and may search the web if needed</p>
        </div>
      )}
      
      {/* Show sources while generating response */}
      {isSearchingWeb && sources.length > 0 && isLoading && (
        <div className="w-full p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium mb-3">🌐 Searching web for: <span className="text-primary">{searchQuery}</span></p>
          <div className="flex flex-wrap gap-2">
            {sources.map((site, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md border border-border">
                <img 
                  src={`https://icons.duckduckgo.com/ip3/${site.domain}.ico`}
                  alt=""
                  className="w-4 h-4"
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
                <span className="text-xs text-muted-foreground">{site.domain}</span>
              </div>
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
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
  const [searchingWebsites, setSearchingWebsites] = useState<{url: string, domain: string}[]>([]);
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
    setSearchingWebsites([]);

    try {
      // Web search using Whoogle if question needs external knowledge
      let webSearchResults = '';
      const searchedWebsites: {url: string, domain: string}[] = [];
      
      if (!linkUrl && !image && question.trim()) {
        try {
          const searchQuery = encodeURIComponent(question.trim());
          const whoogleResponse = await fetch(`https://whoogle-bbso.onrender.com/search?q=${searchQuery}&format=json`);
          
          if (whoogleResponse.ok) {
            const searchData = await whoogleResponse.json();
            
            if (searchData && Array.isArray(searchData)) {
              // Take top 3 results
              for (const item of searchData.slice(0, 3)) {
                if (item.url && item.url.startsWith('http')) {
                  try {
                    const url = new URL(item.url);
                    const websiteInfo = {
                      url: item.url,
                      domain: url.hostname.replace('www.', '')
                    };
                    searchedWebsites.push(websiteInfo);
                    setSearchingWebsites(prev => [...prev, websiteInfo]);
                    
                    // Fetch content from this URL
                    const pageResponse = await fetch(item.url);
                    const html = await pageResponse.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    
                    // Remove unwanted elements
                    const unwantedElements = doc.querySelectorAll('script, style, nav, header, footer, aside');
                    unwantedElements.forEach(el => el.remove());
                    
                    const mainContent = doc.body?.textContent || '';
                    const cleanContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 800);
                    
                    if (cleanContent) {
                      webSearchResults += `\n\n[From ${item.url}]: ${cleanContent}`;
                    }
                  } catch (err) {
                    console.error('Failed to fetch search result:', err);
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('Whoogle search failed:', err);
        }
      }

      // System prompt - ULTRA CONCISE responses
      const systemPrompt = `You are Alexzo Intelligence by Alexzo. Give DIRECT, SHORT answers only.

RULES:
- Maximum 2-4 sentences total
- Answer the question directly first
- No long explanations unless asked
- Use **bold** for key points only
- For code/websites: give main point only, not full summary

Be helpful but BRIEF.`;

      // Fetch URL content if provided with enhanced extraction
      let urlContent = '';
      let relatedSourcesContent: string[] = [];
      let relatedSourcesUrls: {url: string, domain: string}[] = [];
      
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
          
          // Get main content (limit to 1200 chars for faster processing)
          const mainContent = doc.body?.textContent || '';
          urlContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 1200);
          
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
                      relatedSourcesContent.push(`[From ${fullUrl}]: ${relatedText}`);
                      const relatedUrl = new URL(fullUrl);
                      relatedSourcesUrls.push({
                        url: fullUrl,
                        domain: relatedUrl.hostname.replace('www.', '')
                      });
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
      
      if (webSearchResults) {
        userMessageContent += `\n\nWeb Search Results:\n${webSearchResults}`;
      }
      
      if (linkUrl && urlContent) {
        userMessageContent += `\n\nWebsite Content from ${linkUrl}:\n${urlContent}`;
        
        if (relatedSourcesContent.length > 0) {
          userMessageContent += `\n\nRelated Sources:\n${relatedSourcesContent.join('\n\n')}`;
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

      // MODEL USED: pollinations.ai with 'openai' (supports vision + fast responses)
      // Alternative models: 'mistral', 'llama' (but no vision support)
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          model: 'openai', // Vision-capable model for image analysis
          seed: Math.floor(Math.random() * 1000000),
          jsonMode: false
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const text = await response.text();
      setResult(text);

      // Extract sources - include web search results, main URL and related sources
      const sourcesArray: {url: string, domain: string}[] = [];
      
      // Add web search sources
      if (searchedWebsites.length > 0) {
        sourcesArray.push(...searchedWebsites);
      }
      
      if (linkUrl) {
        try {
          const url = new URL(linkUrl);
          sourcesArray.push({
            url: linkUrl,
            domain: url.hostname.replace('www.', '')
          });
          // Add related sources if they were fetched
          if (relatedSourcesUrls.length > 0) {
            sourcesArray.push(...relatedSourcesUrls);
          }
        } catch (e) {
          console.error('Invalid URL:', e);
        }
      }
      setSources(sourcesArray);

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
      
      {/* Searching Websites Progress */}
      {searchingWebsites.length > 0 && isLoading && (
        <div className="w-full p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium mb-3">🔍 Searching web...</p>
          <div className="flex flex-wrap gap-2">
            {searchingWebsites.map((site, idx) => (
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
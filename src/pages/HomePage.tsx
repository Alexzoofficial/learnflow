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
  const [sources, setSources] = useState<{url: string, domain: string, completed: boolean}[]>([]);
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
      // Optimized system prompt - Alexzo Intelligence
      const systemPrompt = `You are LearnFlow powered by Alexzo Intelligence - an advanced AI assistant.

🎯 **Identity**: LearnFlow powered by Alexzo Intelligence
📌 **Mission**: Deliver precise, actionable answers with zero fluff.

🔥 **Capabilities**:
✅ Visual Intelligence - Analyze images, diagrams, charts
✅ Math Visualization - LaTeX equations: $E=mc^2$ or $$\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$
✅ Code Generation - Clean code with syntax highlighting
✅ Adaptive Tone - Funny 😄, serious, or technical based on context
✅ Rich Formatting - Tables, lists, diagrams, emojis where appropriate

📝 **Response Rules**:
1. **Direct Answer First** - No preambles
2. **Rich Markdown**:
   - **Bold** for key concepts
   - *Italics* for emphasis
   - \`code\` for technical terms
   - Code blocks with language tags
   - Tables for comparisons
   - LaTeX for math: $inline$ or $$block$$
3. **Tone Matching**:
   - Funny queries → Add wit & emojis 😎
   - Serious topics → Professional & empathetic
   - Technical → Precise terminology
4. **Visual Aids**: ASCII diagrams, tables, structured lists
5. **Length**: 3-6 sentences for simple queries, 10-15 for complex topics

🚫 **Never**:
❌ Generic/template answers
❌ Repeat user's question
❌ Excessive politeness ("I'd be happy to...")
❌ Irrelevant info

✨ **Example Formats**:

**Simple Query**: "What is photosynthesis?"
**Photosynthesis** converts light → chemical energy (glucose). Plants use **chlorophyll** to capture sunlight, split H₂O, and fix CO₂ into glucose. Equation: \`6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\`. Produces oxygen for Earth! 🌱

**Math Query**: Use LaTeX and step-by-step explanations
**Code Query**: Include syntax-highlighted blocks
**Funny Query**: Add humor while staying informative 😄

Subject: ${activeSubject}`;


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
              domain: url.hostname.replace('www.', ''),
              completed: true
            }]);
          }
        } catch (err) {
          console.error('Failed to fetch URL:', err);
        }
      }

      // Smart web search detection - only search when truly needed
      const lowerQuestion = question.toLowerCase();
      const searchKeywords = ['latest', 'current', 'recent', 'today', 'now', '2024', '2025', 'update', 'news', 'price', 'stock', 'weather', 'score', 'live', 'happening', 'trending'];
      const factualKeywords = ['who is', 'what happened', 'when did', 'where is', 'how much', 'results', 'winner', 'election'];
      
      // Check if question needs real-time/factual data
      const hasSearchKeyword = searchKeywords.some(keyword => lowerQuestion.includes(keyword));
      const hasFactualKeyword = factualKeywords.some(keyword => lowerQuestion.includes(keyword));
      
      // Exclude general knowledge questions that don't need web search
      const generalKnowledgePatterns = ['what is', 'explain', 'how to', 'why does', 'define', 'meaning of', 'difference between', 'compare'];
      const isGeneralKnowledge = generalKnowledgePatterns.some(pattern => lowerQuestion.includes(pattern)) && !hasSearchKeyword;
      
      // Only do web search when really needed
      const needsWebSearch = (hasSearchKeyword || hasFactualKeyword) && !isGeneralKnowledge;
      
      if (needsWebSearch) {
        setIsSearchingWeb(true);
        setSearchQuery(question);
      }

      // Prepare messages for AI
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Handle image if provided - pass as base64 in message
      if (image) {
        const imageBase64 = await convertImageToBase64(image);
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        });
      } else {
        messages.push({
          role: 'user',
          content: userMessage
        });
      }

      // Perform web search if needed with progressive source display
      let searchContext = '';
      if (needsWebSearch) {
        try {
          const searchQuery = encodeURIComponent(question);
          const searchResponse = await fetch(`https://whoogle-bbso.onrender.com/search?q=${searchQuery}&format=json`);
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            if (Array.isArray(searchData)) {
              const validResults = searchData.filter((item: any) => item.url?.startsWith('http')).slice(0, 3);
              
              // Initialize sources with loading state
              const initialSources = validResults.map((item: any) => {
                const url = new URL(item.url);
                return {
                  url: item.url,
                  domain: url.hostname.replace('www.', ''),
                  completed: false
                };
              });
              setSources(initialSources);
              
              // Fetch content from search results sequentially to show progress
              const fetchedContents: string[] = [];
              for (let i = 0; i < validResults.length; i++) {
                const item = validResults[i];
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
                    
                    fetchedContents.push(`[Source: ${item.url}]\n${text}`);
                  }
                } catch (err) {
                  console.error('Failed to fetch page:', err);
                }
                
                // Mark this source as completed
                setSources(prev => prev.map((s, idx) => 
                  idx === i ? { ...s, completed: true } : s
                ));
              }
              
              searchContext = fetchedContents.filter(c => c).join('\n\n');
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

      // Call Pollinations.ai searchGPT API with proper error handling
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: 'searchgpt', // Using Pollinations.ai searchGPT for better responses
          seed: Math.floor(Math.random() * 1000000),
          jsonMode: false
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`AI request failed: ${errorText}`);
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
      
      {/* Enhanced Processing UI - Without Icon */}
      {isLoading && (
        <div className="w-full p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
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
      
      {/* Progressive Sources Display with Tick Marks */}
      {isSearchingWeb && sources.length > 0 && isLoading && (
        <div className="w-full p-5 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border-2 border-accent/20">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <span>Visiting sources: <span className="text-primary font-bold">{searchQuery}</span></span>
          </p>
          <div className="space-y-2.5">
            {sources.map((site, idx) => (
              <div 
                key={idx} 
                className={`group flex items-center gap-3 px-4 py-2.5 bg-background/80 backdrop-blur-sm rounded-lg border transition-all duration-300 ${
                  site.completed 
                    ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' 
                    : 'border-border animate-pulse'
                }`}
              >
                <div className="relative flex-shrink-0">
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
                </div>
                <a 
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {site.domain}
                </a>
                {site.completed ? (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary animate-spin border-t-transparent"></div>
                )}
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
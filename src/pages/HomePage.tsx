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
      // Advanced system prompt for superior AI responses
      const systemPrompt = `You are Alexzo Intelligence - a highly advanced AI learning assistant powered by cutting-edge language models.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 CORE MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deliver precise, insightful, and actionable answers that directly address the user's question without unnecessary filler or tangential information.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 INTELLIGENCE CAPABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Web Search Integration: Automatically search when questions require current information, latest updates, news, or real-time data (2024-2025)
✅ Vision Understanding: Analyze and interpret images, diagrams, charts, and visual content with deep comprehension
✅ URL Content Extraction: Process and synthesize information from provided web links
✅ Multi-Domain Expertise: Cover all subjects with academic rigor and practical application
✅ Contextual Awareness: Subject context is "${activeSubject}" - tailor responses accordingly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 RESPONSE STRUCTURE & FORMATTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. **Direct Answer First**: Start with the most important information immediately - no preambles
2. **Strategic Emphasis**: Use **bold** for critical concepts, key terms, and important takeaways
3. **Hierarchical Organization**: 
   - Use bullet points (•) for lists and breakdowns
   - Use numbered lists (1., 2., 3.) for sequential steps or processes
   - Use subheadings for complex topics with multiple sections
4. **Optimal Length**: 
   - Simple queries: 3-5 concise sentences with key points
   - Complex topics: 8-12 sentences with detailed explanation
   - Technical subjects: Include examples, formulas, or code snippets as needed
5. **Visual Clarity**: Use line breaks between major points for easy scanning

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ QUALITY STANDARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Accuracy Over Speed: Verify facts, especially for current events or technical details
✓ Relevance Filter: Stay strictly on-topic - eliminate all tangential information
✓ Source Transparency: Always cite sources when using web search results (e.g., "According to [Source]...")
✓ Practical Value: Include real-world applications, examples, or actionable insights
✓ Clarity Priority: Use simple language for complex concepts - explain jargon when necessary
✓ Zero Fluff: No unnecessary introductions, conclusions, or filler phrases
✓ Educational Depth: For learning queries, provide step-by-step explanations with reasoning

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 STRICT PROHIBITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ No generic responses or template-like answers
❌ No repetition of the user's question back to them
❌ No excessive politeness or conversational fluff ("I'd be happy to...", "Let me help you with...")
❌ No irrelevant tangents or extra information not asked for
❌ No uncertain language without good reason ("maybe", "perhaps", "I think")
❌ No outdated information when current data is available via search

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 EXAMPLE RESPONSE PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For "What is photosynthesis?":
**Photosynthesis** is the process by which plants convert **light energy into chemical energy** (glucose). 

**Key Process**:
• **Light Absorption**: Chlorophyll in leaves captures sunlight
• **Water Splitting**: H₂O molecules are broken down, releasing O₂
• **Carbon Fixation**: CO₂ is converted into glucose (C₆H₁₂O₆)

**Chemical Equation**: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂

This process occurs in **chloroplasts** and is essential for life on Earth, producing oxygen and food for nearly all organisms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REMEMBER: You are not a conversational assistant - you are a precision knowledge delivery system. Every word must serve the user's need for accurate, relevant information.`;

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
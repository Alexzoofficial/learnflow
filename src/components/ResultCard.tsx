import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useToast } from '@/hooks/use-toast';

interface ResultCardProps {
  isLoading: boolean;
  result: string | null;
  error: string | null;
  sources?: {url: string, domain: string, completed: boolean}[];
}

export const ResultCard: React.FC<ResultCardProps> = ({ isLoading, result, error, sources = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);
  const [copied, setCopied] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    // The voices are loaded asynchronously, so we need to listen for the voiceschanged event.
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices(); // Initial load

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const getCleanTextForSpeech = (text: string) => {
    return text
      .replace(/[#*_`]/g, '') // Remove markdown symbols
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Replace links with just text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  };

  const startSpeech = () => {
    if (!result || isPlaying || voices.length === 0) return;

    // Prioritized list of high-quality male voices
    const priorityVoices = [
      'Microsoft David - English (United States)',
      'Google UK English Male',
      'Daniel',
      'Google US English',
    ];

    let selectedVoice = null;

    // Find the best voice from our priority list
    for (const name of priorityVoices) {
      const found = voices.find(v => v.name === name);
      if (found) {
        selectedVoice = found;
        break;
      }
    }

    // Fallback to any English male voice
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male')) || null;
    }

    const cleanText = getCleanTextForSpeech(result);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.0; // Natural pace
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 0.9;
    
    utterance.onend = () => {
      setIsPlaying(false);
      setSpeech(null);
    };
    
    utterance.onerror = () => {
      setIsPlaying(false);
      setSpeech(null);
    };

    speechSynthesis.speak(utterance);
    setSpeech(utterance);
    setIsPlaying(true);
  };

  const toggleSpeech = () => {
    if (!result) return;

    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setSpeech(null);
    } else {
      startSpeech();
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <Card className="shadow-medium border-0 border-l-4 border-l-destructive">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-destructive/10 rounded-full flex items-center justify-center">
              <span className="text-destructive text-xs sm:text-sm">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-destructive mb-2 text-sm sm:text-base">Error</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="shadow-medium border-0">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                <Lightbulb className="h-4 w-4 sm:h-6 sm:w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                AI Response
              </h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Copy</span>
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSpeech}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Listen</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-4 sm:px-6">
          <div className="prose prose-gray max-w-none dark:prose-invert prose-sm sm:prose-base text-foreground leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({children}) => <h1 className="text-xl sm:text-2xl font-bold mb-4 text-primary">{children}</h1>,
                h2: ({children}) => <h2 className="text-lg sm:text-xl font-bold mb-3 text-primary">{children}</h2>,
                h3: ({children}) => <h3 className="text-base sm:text-lg font-semibold mb-2 text-primary">{children}</h3>,
                p: ({children}) => <p className="mb-3 text-sm sm:text-base leading-relaxed">{children}</p>,
                ul: ({children}) => <ul className="mb-4 ml-4 space-y-1">{children}</ul>,
                ol: ({children}) => <ol className="mb-4 ml-4 space-y-1">{children}</ol>,
                li: ({children}) => <li className="text-sm sm:text-base leading-relaxed">{children}</li>,
                strong: ({children}) => <strong className="font-semibold text-primary">{children}</strong>,
                em: ({children}) => <em className="italic">{children}</em>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4">{children}</blockquote>,
                code: ({children}) => <code className="bg-muted px-1 py-0.5 rounded text-xs sm:text-sm font-mono">{children}</code>,
                pre: ({children}) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs sm:text-sm">{children}</pre>,
                // Responsive table components
                table: ({children}) => (
                  <div className="overflow-x-auto -mx-4 sm:mx-0 my-4">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-border border border-border rounded-lg text-xs sm:text-sm">
                        {children}
                      </table>
                    </div>
                  </div>
                ),
                thead: ({children}) => <thead className="bg-muted/50">{children}</thead>,
                tbody: ({children}) => <tbody className="divide-y divide-border bg-background">{children}</tbody>,
                tr: ({children}) => <tr className="hover:bg-muted/30 transition-colors">{children}</tr>,
                th: ({children}) => <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider whitespace-nowrap">{children}</th>,
                td: ({children}) => <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-muted-foreground whitespace-normal break-words max-w-[120px] sm:max-w-none">{children}</td>
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
          
          {/* Enhanced Sources Section - Clickable Cards */}
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Sources ({sources.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group"
                  >
                    {/* Favicon */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                        alt=""
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
                        }}
                      />
                      {source.completed && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {/* Domain Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {source.domain}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {source.url.length > 40 ? source.url.slice(0, 40) + '...' : source.url}
                      </p>
                    </div>
                    {/* Arrow Icon */}
                    <svg className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};
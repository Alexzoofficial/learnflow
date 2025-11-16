import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const { toast } = useToast();

  const getCleanTextForSpeech = (text: string) => {
    return text
      .replace(/[#*_`]/g, '') // Remove markdown symbols
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Replace links with just text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
  };

  const startSpeech = () => {
    if (!result || isPlaying) return;
    
    // Use a more natural voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Google'))
    );
    
    const cleanText = getCleanTextForSpeech(result);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (preferredVoices.length > 0) {
      utterance.voice = preferredVoices[0];
    }
    
    utterance.rate = 0.85; // Slightly slower for better clarity
    utterance.pitch = 1.1; // Slightly higher pitch for more pleasant sound
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
              remarkPlugins={[remarkGfm]}
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
                pre: ({children}) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-xs sm:text-sm">{children}</pre>
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
          
          {/* Sources Section */}
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Sources</h4>
              <div className="space-y-2">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <img 
                      src={`https://icons.duckduckgo.com/ip3/${source.domain}.ico`}
                      alt=""
                      className="w-4 h-4 flex-shrink-0"
                      loading="eager"
                      onError={(e) => {
                        // Fallback to Google favicon if DDG fails
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('google.com')) {
                          target.src = `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`;
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                    <span className="text-sm text-primary group-hover:underline truncate">
                      {source.domain}
                    </span>
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
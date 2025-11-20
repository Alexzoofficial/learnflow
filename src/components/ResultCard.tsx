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
    
    // Use a more natural, realistic male voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Male') || voice.name.includes('Daniel') || voice.name.includes('Google US English'))
    );
    
    const cleanText = getCleanTextForSpeech(result);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Select the best available male voice
    let selectedVoice = voices.find(v => v.name === 'Google US English');
    if (preferredVoices.length > 0) {
      selectedVoice = preferredVoices[0];
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = 1.0; // Natural pace
    utterance.pitch = 1.0; // Natural pitch for a male voice
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
          
          {/* Sources Section - With tick marks */}
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Sources
              </h4>
              <div className="space-y-2">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-all duration-200 group p-2.5 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/20"
                  >
                    {/* Favicon */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`}
                      alt=""
                      className="w-5 h-5 rounded flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23888"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
                      }}
                    />
                    {/* Domain Name */}
                    <span className="group-hover:underline truncate flex-1 font-medium">
                      {source.domain}
                    </span>
                    {/* Tick Mark */}
                    {source.completed && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
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
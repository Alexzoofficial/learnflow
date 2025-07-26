import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, Volume2, VolumeX } from 'lucide-react';

interface ResultCardProps {
  isLoading: boolean;
  result: string | null;
  error: string | null;
}

export const ResultCard: React.FC<ResultCardProps> = ({ isLoading, result, error }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);

  const toggleSpeech = () => {
    if (!result) return;

    if (isPlaying) {
      // Stop speech
      speechSynthesis.cancel();
      setIsPlaying(false);
      setSpeech(null);
    } else {
      // Start speech
      const utterance = new SpeechSynthesisUtterance(result.replace(/[#*]/g, ''));
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
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
    }
  };
  if (isLoading) {
    return (
      <Card className="shadow-medium border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              LearnFlow is preparing your detailed answer...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-medium border-0 border-l-4 border-l-destructive">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
              <span className="text-destructive text-sm">!</span>
            </div>
            <div>
              <h3 className="font-semibold text-destructive mb-2">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="shadow-medium border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                AI Response
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSpeech}
              className="flex items-center gap-2"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  Listen
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="prose prose-gray max-w-none">
            <div 
              className="text-foreground leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: result }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
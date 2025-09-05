import React, { useState } from 'react';
import { SubjectTabs } from '@/components/SubjectTabs';
import { QuestionInput } from '@/components/QuestionInput';
import { ResultCard } from '@/components/ResultCard';
import { FeatureCards } from '@/components/FeatureCards';
import { YouTubeVideos } from '@/components/YouTubeVideos';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useRequestLimit } from '@/hooks/useRequestLimit';
import { RequestLimitBanner } from '@/components/RequestLimitBanner';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  embed: string;
}

interface HomePageProps {
  user?: any;
  onShowAuth?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, onShowAuth }) => {
  const [activeSubject, setActiveSubject] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const { toast } = useToast();
  const { isLimitReached, remainingRequests, incrementRequest } = useRequestLimit();

  const handleQuestionSubmit = async (question: string, image?: File, linkUrl?: string) => {
    // Check request limit for unauthenticated users
    if (!user && isLimitReached) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit. Please sign in to continue.",
        variant: "destructive",
      });
      onShowAuth?.();
      return;
    }

    // For unauthenticated users, check if they can make a request
    if (!user && !incrementRequest()) {
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily limit of 5 requests. Please sign in to continue.",
        variant: "destructive",
      });
      onShowAuth?.();
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let requestData: any = { prompt: question };
      
      // Convert image to base64 if provided
      if (image) {
        console.log('Converting image to base64:', image.name, image.size);
        const base64 = await convertImageToBase64(image);
        requestData.image = base64;
        console.log('Image converted to base64, length:', base64.length);
      }

      // Add link URL if provided
      if (linkUrl) {
        requestData.linkUrl = linkUrl;
      }

      console.log('Sending request to AI:', requestData);

      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: requestData
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('AI response received:', data);
      setResult(data.text);
      setVideos(data.videos || []);
      
      toast({
        title: "Answer Generated!",
        description: "AI has provided a detailed response to your question.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response. Please try again.';
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
      
      {/* YouTube Videos - Mobile Grid */}
      {videos.length > 0 && (
        <div className="w-full">
          <YouTubeVideos videos={videos} />
        </div>
      )}
      
      {/* Feature Cards - Mobile Responsive Grid */}
      <div className="w-full">
        <FeatureCards />
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { SubjectTabs } from '@/components/SubjectTabs';
import { QuestionInput } from '@/components/QuestionInput';
import { ResultCard } from '@/components/ResultCard';
import { FeatureCards } from '@/components/FeatureCards';
import { YouTubeVideos } from '@/components/YouTubeVideos';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  embed: string;
}

export const HomePage: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const { toast } = useToast();

  const handleQuestionSubmit = async (question: string, image?: File, linkUrl?: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let requestData: any = { prompt: question };
      
      // Convert image to base64 if provided
      if (image) {
        const base64 = await convertImageToBase64(image);
        requestData.image = base64;
      }

      // Add link URL if provided
      if (linkUrl) {
        requestData.linkUrl = linkUrl;
      }

      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: requestData
      });

      if (error) throw error;

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
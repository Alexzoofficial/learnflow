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

  const handleQuestionSubmit = async (question: string, image?: File) => {
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

      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: requestData
      });

      if (error) {
        throw new Error(error.message || 'Failed to get AI response');
      }

      if (data.error) {
        throw new Error(data.error);
      }

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
    <div className="space-y-8">
      <SubjectTabs 
        activeSubject={activeSubject} 
        onSubjectChange={setActiveSubject} 
      />
      
      <QuestionInput 
        onSubmit={handleQuestionSubmit} 
        isLoading={isLoading} 
      />
      
      <ResultCard 
        isLoading={isLoading} 
        result={result} 
        error={error} 
      />
      
      {videos.length > 0 && (
        <YouTubeVideos videos={videos} />
      )}
      
      <FeatureCards />
    </div>
  );
};
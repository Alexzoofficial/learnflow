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
  const { toast } = useToast();
  const { isLimitReached, remainingRequests, incrementRequest } = useRequestLimit();

  const handleQuestionSubmit = async (question: string, image?: File, linkUrl?: string) => {
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

    try {
      // System prompt for Alexzo Intelligence
      const systemPrompt = `You are Alexzo Intelligence for LearnFlow by Alexzo. Provide clear, accurate explanations. Break down complex concepts. Support K-12 to graduate education in Math, Science, History, Literature, Tech. Show step-by-step solutions. KEEP RESPONSES SHORT AND CONCISE - 2-3 paragraphs maximum.`;

      // Fetch URL content if provided
      let urlContent = '';
      if (linkUrl) {
        try {
          const urlResponse = await fetch(linkUrl);
          const text = await urlResponse.text();
          urlContent = text.substring(0, 1500); // Reduced limit to avoid token overflow
        } catch (err) {
          console.error('Failed to fetch URL:', err);
        }
      }

      // Prepare the prompt with system context and subject context
      let fullPrompt = `${systemPrompt}\n\nSubject Context: ${activeSubject}\n\nStudent Question: ${question}`;
      
      if (linkUrl) {
        fullPrompt += `\n\nReference URL: ${linkUrl}`;
        if (urlContent) {
          fullPrompt += `\n\nURL Content: ${urlContent}`;
        }
      }

      // Handle image if provided
      let imageBase64 = '';
      if (image) {
        imageBase64 = await convertImageToBase64(image);
      }

      // Call pollinations.ai API (free, no API key needed)
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: imageBase64 
                ? `${fullPrompt}\n\n[Image provided for analysis]`
                : fullPrompt
            }
          ],
          model: 'gpt-5-nano',
          seed: Math.floor(Math.random() * 1000000),
          jsonMode: false
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const text = await response.text();
      setResult(text);

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
      
      {/* Result Card - Mobile Optimized */}
      <div className="w-full">
        <ResultCard 
          isLoading={isLoading} 
          result={result} 
          error={error} 
        />
      </div>
      
      {/* Feature Cards - Mobile Responsive Grid */}
      <div className="w-full">
        <FeatureCards />
      </div>
    </div>
  );
};
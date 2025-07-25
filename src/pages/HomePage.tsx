import React, { useState } from 'react';
import { SubjectTabs } from '@/components/SubjectTabs';
import { QuestionInput } from '@/components/QuestionInput';
import { ResultCard } from '@/components/ResultCard';
import { FeatureCards } from '@/components/FeatureCards';
import { useToast } from '@/hooks/use-toast';

export const HomePage: React.FC = () => {
  const [activeSubject, setActiveSubject] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleQuestionSubmit = async (question: string, image?: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response based on subject and question type
      let mockResponse = '';
      
      if (image) {
        mockResponse = `## Image Analysis Results

I can see the uploaded image. Based on the visual content, here's my analysis:

**Step 1: Image Recognition**
- I've identified key elements in the image
- The content appears to be related to ${activeSubject}

**Step 2: Detailed Explanation**
This is a demonstration of LearnFlow's image analysis capabilities. In a real implementation, this would connect to Google's Gemini Vision API to provide detailed analysis of mathematical equations, scientific diagrams, text passages, or any educational content in images.

**Step 3: Learning Guidance**
- Key concepts to understand
- Related topics to explore
- Practice suggestions

*Note: This is a demo interface. Connect your Google Gemini API key to enable real AI responses.*`;
      } else {
        mockResponse = `## ${activeSubject.charAt(0).toUpperCase() + activeSubject.slice(1)} - Detailed Response

**Understanding Your Question:**
"${question}"

**Step-by-Step Explanation:**

**Step 1: Breaking Down the Concept**
This is a demonstration of LearnFlow's AI-powered learning assistant. Your question about ${activeSubject} would be processed by Google's Gemini AI to provide comprehensive, educational responses.

**Step 2: Key Learning Points**
- Fundamental concepts explained clearly
- Real-world applications and examples
- Common misconceptions addressed

**Step 3: Practice and Application**
- Sample problems to try
- Related topics to explore
- Study recommendations

**Step 4: Further Learning**
Additional resources and next steps for deeper understanding.

*Note: This is a demo interface. To get real AI-powered responses, you would need to integrate with Google's Gemini API using your own API key.*`;
      }

      setResult(mockResponse);
      toast({
        title: "Answer Generated!",
        description: "LearnFlow has provided a detailed response to your question.",
      });
    } catch (err) {
      setError('Failed to get response. Please try again.');
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      
      <FeatureCards />
    </div>
  );
};
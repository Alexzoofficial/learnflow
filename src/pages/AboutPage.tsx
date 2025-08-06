import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, Globe, Lightbulb, ArrowLeft } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-4 text-muted-foreground hover:text-foreground"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          About LearnFlow
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Powered by Alexzo, LearnFlow is an innovative AI-powered learning assistant designed to help students and lifelong learners grasp complex concepts across multiple subjects.
        </p>
      </div>

      <Card className="shadow-medium border-0">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Educational Excellence</h3>
                  <p className="text-muted-foreground">
                    Ask questions in plain English or Hindi and receive detailed, step-by-step explanations that help you understand the 'how' and 'why' behind every answer.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Intelligence</h3>
                  <p className="text-muted-foreground">
                    Leveraging Google's advanced Gemini AI models, fine-tuned to provide comprehensive educational support across all academic levels.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Multi-Subject Coverage</h3>
                  <p className="text-muted-foreground">
                    Explore topics in Mathematics, Physics, Chemistry, Biology, English, Hindi, and more with our comprehensive subject support.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Visual Learning</h3>
                  <p className="text-muted-foreground">
                    Submit questions via text input or by uploading images of your queries for comprehensive visual analysis and explanations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-0 bg-gradient-surface">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">What You Can Do with LearnFlow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Ask questions in plain English or Hindi</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Receive detailed, step-by-step explanations</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Submit questions via text or image upload</span>
              </li>
            </ul>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Explore multiple academic subjects</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Build strong foundational knowledge</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Access 24/7 patient tutoring support</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          We believe in the power of understanding the 'how' and 'why' behind answers. LearnFlow is your patient tutor, available 24/7 to guide you through challenging problems.
        </p>
        <p className="text-2xl font-semibold mt-4 bg-gradient-secondary bg-clip-text text-transparent">
          Happy Learning! 🎓
        </p>
      </div>
    </div>
  );
};
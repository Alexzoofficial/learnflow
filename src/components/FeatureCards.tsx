import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Languages, Camera, Zap } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Multi-Subject',
    description: 'Covers a wide range of academic subjects.',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    icon: Languages,
    title: 'Language Support',
    description: 'Understands questions in English and Hindi.',
    gradient: 'from-green-500 to-green-600'
  },
  {
    icon: Camera,
    title: 'Image Analysis',
    description: 'Solve questions from uploaded images.',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'AI Powered',
    description: 'Intelligent answers by Google Gemini and Alexzo Intelligence.',
    gradient: 'from-orange-500 to-orange-600'
  },
];

export const FeatureCards: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:scale-105 border-0 shadow-soft">
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r ${feature.gradient} mb-2 sm:mb-3 lg:mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
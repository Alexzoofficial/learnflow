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
    description: 'आपका सारा डेटा हमारे पास सुरक्षित है।',
    gradient: 'from-orange-500 to-orange-600'
  },
];

export const FeatureCards: React.FC = () => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="group hover:shadow-medium transition-all duration-300 hover:scale-[1.02] border-0 shadow-soft w-full">
              <CardContent className="p-4 sm:p-5 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r ${feature.gradient} mb-3 text-white group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-2 text-foreground">
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
    </div>
  );
};
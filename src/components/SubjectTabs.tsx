import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubjectTabsProps {
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
}

const subjects = [
  { id: 'general', label: 'General', emoji: '🌐' },
  { id: 'hindi', label: 'Hindi', emoji: '🇮🇳' },
  { id: 'english', label: 'English', emoji: '🇬🇧' },
  { id: 'math', label: 'Math', emoji: '🔢' },
  { id: 'physics', label: 'Physics', emoji: '⚛️' },
  { id: 'chemistry', label: 'Chemistry', emoji: '🧪' },
  { id: 'biology', label: 'Biology', emoji: '🧬' },
];

export const SubjectTabs: React.FC<SubjectTabsProps> = ({ activeSubject, onSubjectChange }) => {
  return (
    <div className="flex overflow-x-auto gap-2 sm:gap-3 pb-2 mb-4 sm:mb-6 border-b border-border scrollbar-hide">
      {subjects.map((subject) => (
        <Button
          key={subject.id}
          variant="tab"
          size="sm"
          className={cn(
            "flex-shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2",
            activeSubject === subject.id && "bg-secondary text-secondary-foreground shadow-soft"
          )}
          onClick={() => onSubjectChange(subject.id)}
        >
          <span className="mr-1 sm:mr-2 text-sm">{subject.emoji}</span>
          {subject.label}
        </Button>
      ))}
    </div>
  );
};
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Clock } from 'lucide-react';

interface RequestLimitBannerProps {
  remainingRequests: number;
  isLimitReached: boolean;
  onShowAuth: () => void;
}

export const RequestLimitBanner: React.FC<RequestLimitBannerProps> = ({ 
  remainingRequests, 
  isLimitReached, 
  onShowAuth 
}) => {
  if (isLimitReached) {
    return (
      <Alert className="border-destructive bg-destructive/10 mb-4">
        <Lock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Daily limit reached. Sign in to continue using LearnFlow.</span>
          <Button onClick={onShowAuth} size="sm" variant="outline">
            Sign In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (remainingRequests <= 2) {
    return (
      <Alert className="border-warning bg-warning/10 mb-4">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{remainingRequests} requests remaining today. Sign in for unlimited access.</span>
          <Button onClick={onShowAuth} size="sm" variant="outline">
            Sign In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
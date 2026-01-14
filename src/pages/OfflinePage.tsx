import React from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflinePageProps {
  onRetry?: () => void;
}

export const OfflinePage: React.FC<OfflinePageProps> = ({ onRetry }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto space-y-6">
        {/* Animated Icon */}
        <div className="relative mx-auto w-32 h-32">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
          
          {/* Main circle */}
          <div className="relative w-full h-full bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full flex items-center justify-center border-4 border-red-500/30">
            <WifiOff className="w-16 h-16 text-red-500" />
          </div>
          
          {/* Floating cloud icons */}
          <div className="absolute -top-2 -left-2 animate-bounce" style={{ animationDelay: '0ms' }}>
            <CloudOff className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <div className="absolute -bottom-2 -right-2 animate-bounce" style={{ animationDelay: '300ms' }}>
            <CloudOff className="w-6 h-6 text-muted-foreground/40" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            No Internet Connection
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            It looks like you're offline. Please check your Wi-Fi or mobile data connection.
          </p>
        </div>

        {/* Tips */}
        <div className="bg-accent/50 rounded-xl p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-foreground">Quick Tips:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Turn on Wi-Fi or mobile data
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Move closer to your router
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Try switching airplane mode on/off
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Restart your device if issue persists
            </li>
          </ul>
        </div>

        {/* Retry Button */}
        <Button 
          onClick={handleRetry}
          size="lg"
          className="w-full sm:w-auto px-8 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Waiting for connection...</span>
        </div>
      </div>
    </div>
  );
};

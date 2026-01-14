import React from 'react';
import { WifiOff, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OfflineModalProps {
  isOpen: boolean;
  onRetry: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ isOpen, onRetry }) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          {/* Animated Icon */}
          <div className="mx-auto mb-4 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-4 border-red-500/30 animate-pulse">
              <WifiOff className="w-10 h-10 text-red-500" />
            </div>
            {/* Signal waves animation */}
            <div className="absolute -top-1 -right-1">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
          
          <DialogTitle className="text-xl font-bold text-center">
            No Internet Connection
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Unable to connect to the internet. Please check your connection and try again.
          </DialogDescription>
        </DialogHeader>

        {/* Tips Section */}
        <div className="bg-accent/50 rounded-lg p-4 my-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            Quick Tips:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Turn on Wi-Fi or mobile data</li>
            <li>• Move closer to your router</li>
            <li>• Toggle airplane mode on/off</li>
            <li>• Restart your device</li>
          </ul>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Waiting for connection...</span>
        </div>

        {/* Retry Button */}
        <Button 
          onClick={onRetry}
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
          size="lg"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>
      </DialogContent>
    </Dialog>
  );
};

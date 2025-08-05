import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

declare global {
  interface Window {
    OneSignal?: any;
  }
}

export const NotificationCenter = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize OneSignal
    const initializeOneSignal = () => {
      if (typeof window !== 'undefined' && window.OneSignal) {
        window.OneSignal.init({
          appId: "YOUR_ONESIGNAL_APP_ID", // Replace with your actual OneSignal App ID
        });

        // Set up notification handlers
        window.OneSignal.on('notificationDisplay', () => {
          setUnreadCount(prev => prev + 1);
        });
      } else {
        console.log("OneSignal not loaded yet. Make sure to include OneSignal SDK in your HTML.");
      }
    };

    // Load OneSignal script if not already loaded
    if (!window.OneSignal) {
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
      script.async = true;
      script.onload = initializeOneSignal;
      document.head.appendChild(script);
    } else {
      initializeOneSignal();
    }
  }, []);

  const handleNotificationClick = async () => {
    try {
      if (window.OneSignal) {
        // Request notification permission
        await window.OneSignal.showSlidedownPrompt();
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNotificationClick}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};
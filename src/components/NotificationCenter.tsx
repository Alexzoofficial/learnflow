import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getNotifications, markNotificationAsRead, subscribeToNotifications } from "@/integrations/firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
  created_at: string | Date;
  read_at?: string | Date;
}

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    fetchNotificationData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotifications(auth.currentUser.uid, (notifications) => {
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read_at).length);
    });

    return () => unsubscribe();
  }, []);

  const fetchNotificationData = async () => {
    try {
      if (!auth.currentUser) return;

      const { data, error } = await getNotifications(auth.currentUser.uid);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read_at).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      if (!auth.currentUser) return;

      const { error } = await markNotificationAsRead(auth.currentUser.uid, notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
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

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-background border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`m-2 cursor-pointer transition-colors ${
                    !notification.read_at 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-background'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {notification.image_url && (
                        <img 
                          src={notification.image_url} 
                          alt=""
                          className="w-12 h-12 rounded object-cover flex-shrink-0"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.read_at && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        
                        {notification.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.description}
                          </p>
                        )}
                        
                        {notification.link_url && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(notification.link_url, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {notification.link_text || 'Open Link'}
                          </Button>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
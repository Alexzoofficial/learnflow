import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Send, Image, Link, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  link_text?: string;
  scheduled_at?: string;
  sent_at?: string;
  is_sent: boolean;
  created_at: string;
}

export const AdminNotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    link_text: '',
    scheduled_at: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const q = query(collection(db, 'notifications'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const notificationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Notification[];
      
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      const notificationData = {
        title: formData.title,
        description: formData.description || null,
        image_url: formData.image_url || null,
        link_url: formData.link_url || null,
        link_text: formData.link_text || null,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at) : null,
        created_by: user.uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        is_sent: false
      };

      await addDoc(collection(db, 'notifications'), notificationData);

      toast.success('Notification created successfully');
      setFormData({
        title: '',
        description: '',
        image_url: '',
        link_url: '',
        link_text: '',
        scheduled_at: ''
      });
      setIsCreating(false);
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to create notification');
    }
  };

  const sendNotification = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, { 
        is_sent: true, 
        sent_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      toast.success('Notification sent successfully');
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));

      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getStatusBadge = (notification: Notification) => {
    if (notification.is_sent) {
      return <Badge variant="default">Sent</Badge>;
    }
    if (notification.scheduled_at && new Date(notification.scheduled_at) > new Date()) {
      return <Badge variant="secondary">Scheduled</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notification Management</h2>
        <Button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Create Notification
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Notification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter notification description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="link_url">Link URL</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="link_text">Link Text</Label>
                  <Input
                    id="link_text"
                    value={formData.link_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_text: e.target.value }))}
                    placeholder="Click here"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduled_at">Schedule for later (optional)</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Notification</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">All Notifications</h3>
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No notifications created yet
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{notification.title}</h4>
                      {getStatusBadge(notification)}
                    </div>
                    
                    {notification.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(notification.created_at).toLocaleDateString()}
                      </div>
                      
                      {notification.scheduled_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Scheduled: {new Date(notification.scheduled_at).toLocaleString()}
                        </div>
                      )}
                      
                      {notification.image_url && (
                        <div className="flex items-center gap-1">
                          <Image className="h-3 w-3" />
                          Has Image
                        </div>
                      )}
                      
                      {notification.link_url && (
                        <div className="flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          Has Link
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!notification.is_sent && (
                      <Button
                        size="sm"
                        onClick={() => sendNotification(notification.id)}
                        className="flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" />
                        Send
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
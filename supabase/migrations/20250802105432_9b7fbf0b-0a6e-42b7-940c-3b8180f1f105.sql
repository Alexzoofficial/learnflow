-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  target_audience TEXT DEFAULT 'all' -- 'all', 'specific_users'
);

-- Create notification_recipients table for tracking who received what
CREATE TABLE public.notification_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Policies for notifications table
CREATE POLICY "Admins can manage all notifications" 
ON public.notifications 
FOR ALL 
USING (created_by = auth.uid());

CREATE POLICY "Users can view sent notifications" 
ON public.notifications 
FOR SELECT 
USING (is_sent = true AND sent_at IS NOT NULL);

-- Policies for notification_recipients table
CREATE POLICY "Users can view their own notification receipts" 
ON public.notification_recipients 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification receipts" 
ON public.notification_recipients 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "System can insert notification receipts" 
ON public.notification_recipients 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_notifications_scheduled_at ON public.notifications(scheduled_at);
CREATE INDEX idx_notifications_sent_at ON public.notifications(sent_at);
CREATE INDEX idx_notification_recipients_user_id ON public.notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_read_at ON public.notification_recipients(read_at);

-- Create function to automatically create recipients when notification is sent
CREATE OR REPLACE FUNCTION public.create_notification_recipients()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create recipients when notification is marked as sent
  IF NEW.is_sent = true AND OLD.is_sent = false THEN
    -- Insert recipients for all users (you can modify this logic as needed)
    INSERT INTO public.notification_recipients (notification_id, user_id)
    SELECT NEW.id, auth.uid()
    FROM auth.users
    WHERE auth.uid() IS NOT NULL
    ON CONFLICT (notification_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic recipient creation
CREATE TRIGGER create_notification_recipients_trigger
  AFTER UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_recipients();

-- Add updated_at trigger for notifications
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
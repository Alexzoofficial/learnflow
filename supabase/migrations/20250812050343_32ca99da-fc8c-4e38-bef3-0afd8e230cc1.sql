-- Fix security issue: Restrict notification access to intended recipients only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view sent notifications" ON public.notifications;

-- Create a secure policy that only allows users to view notifications they are recipients of
CREATE POLICY "Users can view their assigned notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.notification_recipients nr 
    WHERE nr.notification_id = notifications.id 
    AND nr.user_id = auth.uid()
  )
  AND is_sent = true 
  AND sent_at IS NOT NULL
);
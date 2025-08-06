-- Fix critical profile privacy issue
-- Replace overly permissive profile policy with proper access control
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create proper profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing profiles of other users only in specific contexts (e.g., public display names)
CREATE POLICY "Public profile information viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (display_name IS NOT NULL AND avatar_url IS NOT NULL);

-- Fix notification_recipients policy to be more restrictive
DROP POLICY IF EXISTS "System can insert notification receipts" ON public.notification_recipients;

-- Create proper notification policies
CREATE POLICY "Authenticated users can insert their own notification receipts"
ON public.notification_recipients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add user_id validation to profiles table to prevent null user_id
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Update database functions for better security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Don't block the operation if timestamp update fails
    RAISE LOG 'Error updating timestamp: %', SQLERRM;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification_recipients()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only create recipients when notification is marked as sent
  IF NEW.is_sent = true AND (OLD.is_sent = false OR OLD.is_sent IS NULL) THEN
    -- Insert recipients for authenticated users only
    INSERT INTO public.notification_recipients (notification_id, user_id)
    SELECT NEW.id, profiles.user_id
    FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    ON CONFLICT (notification_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating notification recipients: %', SQLERRM;
    RETURN NEW;
END;
$$;
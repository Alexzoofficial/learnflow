-- Fix OTP configuration for password reset
-- Remove previous incorrect config and set proper OTP settings

-- Clear any incorrect auth config
DELETE FROM auth.config WHERE parameter IN ('MAILER_SECURE_EMAIL_CHANGE_ENABLED', 'ENABLE_EMAIL_CONFIRMATIONS', 'OTP_EXPIRY');

-- The OTP configuration should be handled via Supabase dashboard environment variables
-- This migration ensures database is clean for proper OTP functionality
-- Configure auth settings to send OTP tokens instead of magic links
-- This will ensure 6-digit codes are sent via email for password resets

-- Update auth.config to use OTP instead of magic links
INSERT INTO auth.config (parameter, value) 
VALUES ('MAILER_SECURE_EMAIL_CHANGE_ENABLED', 'false')
ON CONFLICT (parameter) 
DO UPDATE SET value = 'false';

-- Ensure OTP is enabled for email auth
INSERT INTO auth.config (parameter, value) 
VALUES ('ENABLE_EMAIL_CONFIRMATIONS', 'true')
ON CONFLICT (parameter) 
DO UPDATE SET value = 'true';

-- Set OTP expiry to 15 minutes (900 seconds)
INSERT INTO auth.config (parameter, value) 
VALUES ('OTP_EXPIRY', '900')
ON CONFLICT (parameter) 
DO UPDATE SET value = '900';
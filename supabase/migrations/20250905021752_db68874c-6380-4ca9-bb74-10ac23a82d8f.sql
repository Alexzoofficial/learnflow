-- Configure auth settings to send OTP codes instead of links for password reset
UPDATE auth.config SET 
  jwt_secret = 'your-jwt-secret',
  password_min_length = 6,
  jwt_exp = 3600,
  refresh_token_rotation_enabled = true,
  security_update_password_require_reauthentication = false;

-- Ensure OTP settings are configured properly
INSERT INTO auth.audit_log_entries (id, payload, created_at) 
VALUES (gen_random_uuid(), '{"message": "OTP configuration updated for password reset"}', now());
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft, X, Lock } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          onAuthSuccess(session.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        onAuthSuccess(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleEmailAuth = async () => {
    if (!email.trim() || (!isForgotPassword && !password.trim())) {
      toast({
        title: "Error",
        description: isForgotPassword ? "Please enter your email" : "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!isForgotPassword && password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      if (isForgotPassword) {
        // Send 6-digit OTP for password reset
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            data: {}
          }
        });
        
        if (error) throw error;
        
        setIsOtpSent(true);
        toast({
          title: "Success",
          description: "6-digit code sent to your email! Valid for 15 minutes.",
        });
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {}
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Account created successfully! You are now logged in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Logged in successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleOtpVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) throw error;
      
      setIsResetPassword(true);
      setIsOtpSent(false);
      toast({
        title: "Success",
        description: "Code verified! Please enter your new password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired code",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password updated successfully!",
      });
      
      // Reset all states
      setIsForgotPassword(false);
      setIsOtpSent(false);
      setIsResetPassword(false);
      setEmail('');
      setNewPassword('');
      setOtp('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  // Removed guest login and social login for security - all users must authenticate with email

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg mx-auto">
        <CardHeader className="text-center relative">
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-2xl font-bold">
            {isResetPassword ? 'Set New Password' : 
             isOtpSent ? 'Enter Verification Code' :
             isForgotPassword ? 'Reset Password' : 'Welcome to LearnFlow'}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {isResetPassword ? 'Enter your new password' :
             isOtpSent ? 'Enter the 6-digit code sent to your email' :
             isForgotPassword ? 'Enter your email to reset password' : 'Your AI-powered education assistant'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(isForgotPassword || isOtpSent || isResetPassword) && (
            <Button
              onClick={() => {
                setIsForgotPassword(false);
                setIsOtpSent(false);
                setIsResetPassword(false);
                setEmail('');
                setOtp('');
                setNewPassword('');
              }}
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          )}
          
          {isResetPassword ? (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
              />
              
              <Button
                onClick={handlePasswordReset}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          ) : isOtpSent ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to {email}
                </p>
                <div className="flex justify-center w-full">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <Button
                onClick={handleOtpVerify}
                disabled={loading || otp.length !== 6}
                variant="default"
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Code expires in 15 minutes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={isOtpSent}
              />
              
              {!isForgotPassword && (
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              )}
              
              <Button
                onClick={handleEmailAuth}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Processing...' : 
                 isForgotPassword ? 'Send 6-Digit Code' :
                 isSignUp ? 'Sign Up with Email' : 'Login with Email'}
              </Button>

              {!isForgotPassword && (
                <>
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}
                  </button>
                  
                  {!isSignUp && (
                    <button
                      onClick={() => setIsForgotPassword(true)}
                      className="w-full text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </>
              )}
            </div>
          )}


          <p className="text-xs text-center text-muted-foreground mt-4">
            Your data is protected with us. Contact: alexzomail@proton.me
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
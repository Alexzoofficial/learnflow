import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
  onClose?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Password reset email sent! Check your inbox.",
        });
        setIsForgotPassword(false);
        setEmail('');
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Success", 
          description: "Account created successfully! Please check your email to verify your account.",
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

  // Removed guest login and social login for security - all users must authenticate with email

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
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
            {isForgotPassword ? 'Reset Password' : 'Welcome to LearnFlow'}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {isForgotPassword ? 'Enter your email to reset password' : 'Your AI-powered education assistant'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isForgotPassword && (
            <Button
              onClick={() => setIsForgotPassword(false)}
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          )}
          
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
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
               isForgotPassword ? 'Send Reset Email' :
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


          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure Supabase authentication. All data is protected with proper access controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
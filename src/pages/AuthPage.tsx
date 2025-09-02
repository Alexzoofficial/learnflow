import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
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

  // Removed guest login for security - all users must authenticate

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Signed in with Google successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Google sign-in failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
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

          {!isForgotPassword && (
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground mt-4">
            Secure Supabase authentication. All data is protected with proper access controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
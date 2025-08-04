import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signIn, signUp, resetPassword } from '@/integrations/firebase/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (user) {
        // Defer any additional operations
        setTimeout(() => {
          onAuthSuccess();
        }, 0);
      }
    });

    return () => unsubscribe();
  }, [onAuthSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, error } = await signIn(email, password);

      if (error) {
        if (error.includes('invalid-credential') || error.includes('user-not-found') || error.includes('wrong-password')) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { user, error } = await signUp(email, password, email);

      if (error) {
        if (error.includes('email-already-in-use')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please try logging in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup Failed",
            description: error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Account Created Successfully!",
          description: "You are now logged in!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: "Reset Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check Your Email",
          description: "Password reset link has been sent to your email.",
        });
        setMode('login');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <Card className="w-full max-w-md shadow-glow border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-primary rounded-full"></div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome Back' : 
             mode === 'signup' ? 'Join LearnFlow' : 
             'Reset Password'}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {mode === 'login' ? 'Continue your learning journey' : 
             mode === 'signup' ? 'Start your educational adventure' : 
             'Get back to learning'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={
            mode === 'login' ? handleLogin : 
            mode === 'signup' ? handleSignup : 
            handleForgotPassword
          } className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 text-lg" disabled={loading}>
              {loading ? 'Please wait...' : 
               mode === 'login' ? 'Sign In' : 
               mode === 'signup' ? 'Create Account' : 
               'Send Reset Link'}
            </Button>
          </form>


          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </p>
              </>
            )}
            
            {mode === 'signup' && (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            )}
            
            {mode === 'forgot' && (
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Back to login
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
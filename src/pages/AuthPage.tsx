import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithGoogle } from '@/integrations/firebase/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
// Using uploaded logo directly

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
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

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const { user, error } = await signInWithGoogle();

      if (error) {
        toast({
          title: "Login Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Logged in successfully with Google!",
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary p-4">
      <Card className="w-full max-w-md shadow-glow border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
            onClick={() => window.history.back()}
          >
            ← Back
          </Button>
          
          <div className="mx-auto w-20 h-20 mb-6">
            <img 
              src="/lovable-uploads/bbca94df-df5d-4480-9c8c-916072af5a0e.png" 
              alt="LearnFlow Logo" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to LearnFlow
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Continue your learning journey with Google
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold py-3 text-lg flex items-center justify-center gap-3" 
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>
          
          <div className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
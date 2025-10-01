import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/integrations/firebase/client';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { Mail, ArrowLeft, X, Lock } from 'lucide-react';

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onAuthSuccess(user);
      }
    });

    return () => unsubscribe();
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
        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        
        setIsOtpSent(true);
        toast({
          title: "Success",
          description: "Password reset email sent! Check your inbox.",
        });
      } else if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        
        toast({
          title: "Success", 
          description: "Account created successfully! You are now logged in.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        
        toast({
          title: "Success", 
          description: "Logged in successfully!",
        });
      }
    } catch (error: any) {
      let errorMessage = "Authentication failed";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleOtpVerify = async () => {
    toast({
      title: "Info",
      description: "Please check your email and click the password reset link.",
    });
    
    setIsForgotPassword(false);
    setIsOtpSent(false);
    setEmail('');
  };

  const handlePasswordReset = async () => {
    toast({
      title: "Info",
      description: "Password reset is handled via email link in Firebase",
    });
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
            {isOtpSent ? 'Check Your Email' :
             isForgotPassword ? 'Reset Password' : 'Welcome to LearnFlow'}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {isOtpSent ? 'A password reset link has been sent to your email' :
             isForgotPassword ? 'Enter your email to reset password' : 'Your AI-powered education assistant'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(isForgotPassword || isOtpSent) && (
            <Button
              onClick={() => {
                setIsForgotPassword(false);
                setIsOtpSent(false);
                setEmail('');
              }}
              variant="ghost"
              className="w-full justify-start p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          )}
          
          {isOtpSent ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  A password reset link has been sent to {email}. Please check your email and click the link to reset your password.
                </p>
              </div>
              
              <Button
                onClick={handleOtpVerify}
                variant="default"
                className="w-full"
              >
                OK
              </Button>
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
                 isForgotPassword ? 'Send Reset Link' :
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
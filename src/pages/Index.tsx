import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { TermsPage } from '@/pages/TermsPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { DisclaimerPage } from '@/pages/DisclaimerPage';
import { AuthPage } from '@/pages/AuthPage';
import { PasswordResetPage } from '@/pages/PasswordResetPage';
import { ProfileMenu } from '@/components/ProfileMenu';
import { ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle password recovery
        if (event === 'PASSWORD_RECOVERY') {
          setActivePage('password-reset');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleAuthSuccess = () => {
    setActivePage('home');
  };

  const handlePasswordReset = () => {
    setActivePage('home');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        setActivePage('home');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'terms':
        return <TermsPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'disclaimer':
        return <DisclaimerPage />;
      case 'auth':
        return <AuthPage onAuthSuccess={handleAuthSuccess} />;
      case 'password-reset':
        return <PasswordResetPage onPasswordReset={handlePasswordReset} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-gradient-primary text-primary-foreground shadow-glow sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 lg:ml-0 ml-12">
              <h1 className="text-xl sm:text-2xl font-bold">LearnFlow</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <ProfileMenu user={user} onLogout={handleLogout} />
              ) : (
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-white/20 flex items-center gap-2 px-4 py-2 rounded-full border border-white/20"
                  onClick={() => setActivePage('auth')}
                >
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  Sign In
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20 rounded-full p-2"
                onClick={() => window.open('https://alexzo.vercel.app', '_blank')}
                title="Visit Website"
              >
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;

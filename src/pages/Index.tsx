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
import { NotificationCenter } from '@/components/NotificationCenter';

import { ExternalLink, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const { track, trackPageView } = useAnalytics();

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setSession(user ? { user } : null);
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Track page changes
  useEffect(() => {
    trackPageView(activePage);
  }, [activePage, trackPageView]);

  const handleAuthSuccess = () => {
    setActivePage('home');
  };

  const handlePasswordReset = () => {
    setActivePage('home');
  };

  const handleLogout = async () => {
    try {
      const { logout } = await import("@/integrations/firebase/auth");
      const { error } = await logout();
      if (error) {
        toast({
          title: "Logout Failed",
          description: error,
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
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        activePage={activePage}
        onPageChange={setActivePage}
      />
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="w-full min-h-screen flex flex-col">
        {/* Mobile-First Header */}
        <header className="bg-gradient-primary text-primary-foreground shadow-glow sticky top-0 z-30 w-full">
          <div className="w-full px-4 py-3 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary-foreground hover:bg-white/20 p-2"
              onClick={toggleSidebar}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            
            {/* App Title */}
            <div className="flex-1 lg:flex-none lg:ml-4">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-center lg:text-left tracking-tight">
                LearnFlow
              </h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {user && <NotificationCenter />}
              {user ? (
                <ProfileMenu user={user} onLogout={handleLogout} />
              ) : (
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-white/20 flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-2 rounded-full border border-white/20 text-xs sm:text-sm"
                  onClick={() => setActivePage('auth')}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <UserIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </div>
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20 rounded-full p-1.5 sm:p-2"
                onClick={() => window.open('https://alexzo.vercel.app', '_blank')}
                title="Visit Website"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area - Mobile Optimized */}
        <main className="flex-1 w-full">
          <div className="w-full max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
            <div className="w-full max-w-4xl mx-auto">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;

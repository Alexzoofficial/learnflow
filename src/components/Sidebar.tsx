import React from 'react';
import { X, Menu, BookOpen, FileText, Info, Shield, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  { id: 'home', label: 'Home (Q&A)', icon: BookOpen },
  { id: 'about', label: 'About LearnFlow', icon: Info },
  { id: 'terms', label: 'Terms & Conditions', icon: FileText },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
  { id: 'disclaimer', label: 'Disclaimer', icon: AlertTriangle },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, activePage, onPageChange }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden",
          "text-white hover:bg-white/20"
        )}
        onClick={onToggle}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-300 ease-in-out shadow-2xl",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border/20">
            <h2 className="text-xl font-bold text-sidebar-foreground text-center">
              LearnFlow Menu
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                        activePage === item.id && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                      onClick={() => {
                        onPageChange(item.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-sidebar-border/20">
            <div className="text-center text-sidebar-foreground/70 text-sm">
              <p>© {new Date().getFullYear()} LearnFlow</p>
              <p className="text-xs mt-1 opacity-80">Powered by Alexzo</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  properties?: Record<string, any>;
  timestamp: string;
}

export const useAnalytics = () => {
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));

  const track = async (eventName: string, properties?: Record<string, any>) => {
    try {
      const user = auth.currentUser;
      
      const event: AnalyticsEvent = {
        event_name: eventName,
        user_id: user?.uid,
        properties: {
          ...properties,
          session_id: sessionId,
          url: window.location.href,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      };

      // Log to console for now (you can send to analytics service later)
      console.log('📊 Analytics Event:', event);
      
      // Store in localStorage for basic tracking
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackPageView = (pageName: string) => {
    track('page_view', { page: pageName });
  };

  const getEvents = () => {
    return JSON.parse(localStorage.getItem('analytics_events') || '[]');
  };

  return { track, trackPageView, getEvents };
};

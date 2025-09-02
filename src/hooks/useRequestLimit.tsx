import { useState, useEffect } from 'react';

const DAILY_REQUEST_LIMIT = 5;
const STORAGE_KEY = 'learnflow_daily_requests';

interface RequestTracker {
  count: number;
  date: string;
}

export const useRequestLimit = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const tracker: RequestTracker = JSON.parse(stored);
      
      if (tracker.date === today) {
        setRequestCount(tracker.count);
        setIsLimitReached(tracker.count >= DAILY_REQUEST_LIMIT);
      } else {
        // New day, reset count
        const newTracker: RequestTracker = { count: 0, date: today };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracker));
        setRequestCount(0);
        setIsLimitReached(false);
      }
    } else {
      // First time user
      const newTracker: RequestTracker = { count: 0, date: today };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracker));
    }
  }, []);

  const incrementRequest = (): boolean => {
    const today = new Date().toDateString();
    const newCount = requestCount + 1;
    
    const tracker: RequestTracker = { count: newCount, date: today };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
    
    setRequestCount(newCount);
    const limitReached = newCount >= DAILY_REQUEST_LIMIT;
    setIsLimitReached(limitReached);
    
    return !limitReached; // Return true if request is allowed
  };

  const getRemainingRequests = (): number => {
    return Math.max(0, DAILY_REQUEST_LIMIT - requestCount);
  };

  return {
    requestCount,
    isLimitReached,
    remainingRequests: getRemainingRequests(),
    incrementRequest,
    dailyLimit: DAILY_REQUEST_LIMIT,
  };
};
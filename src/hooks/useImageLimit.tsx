import { useState, useEffect } from 'react';

const DAILY_IMAGE_LIMIT = 5;
const STORAGE_KEY = 'learnflow_daily_images';

interface ImageTracker {
  count: number;
  date: string;
}

export const useImageLimit = () => {
  const [imageCount, setImageCount] = useState(0);
  const [isImageLimitReached, setIsImageLimitReached] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const tracker: ImageTracker = JSON.parse(stored);
      
      if (tracker.date === today) {
        setImageCount(tracker.count);
        setIsImageLimitReached(tracker.count >= DAILY_IMAGE_LIMIT);
      } else {
        // New day, reset count
        const newTracker: ImageTracker = { count: 0, date: today };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracker));
        setImageCount(0);
        setIsImageLimitReached(false);
      }
    } else {
      // First time user
      const newTracker: ImageTracker = { count: 0, date: today };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTracker));
    }
  }, []);

  const incrementImageCount = (): boolean => {
    const today = new Date().toDateString();
    const newCount = imageCount + 1;
    
    const tracker: ImageTracker = { count: newCount, date: today };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracker));
    
    setImageCount(newCount);
    const limitReached = newCount >= DAILY_IMAGE_LIMIT;
    setIsImageLimitReached(limitReached);
    
    return !limitReached; // Return true if upload is allowed
  };

  const getRemainingImages = (): number => {
    return Math.max(0, DAILY_IMAGE_LIMIT - imageCount);
  };

  const canUploadImage = (): boolean => {
    return imageCount < DAILY_IMAGE_LIMIT;
  };

  return {
    imageCount,
    isImageLimitReached,
    remainingImages: getRemainingImages(),
    incrementImageCount,
    canUploadImage,
    dailyImageLimit: DAILY_IMAGE_LIMIT,
  };
};

import { useState, useEffect } from 'react';

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscapeMode);
      setOrientation(isLandscapeMode ? 'landscape' : 'portrait');
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    // Also listen for screen orientation API if available
    if (screen.orientation) {
      screen.orientation.addEventListener('change', updateOrientation);
    }

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', updateOrientation);
      }
    };
  }, []);

  return { orientation, isLandscape };
}
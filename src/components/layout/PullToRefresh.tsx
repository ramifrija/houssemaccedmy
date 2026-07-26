import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';

export const PullToRefresh = ({ children }: { children: React.ReactNode }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only apply on native mobile apps
    if (!Capacitor.isNativePlatform()) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh if we are at the very top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = -1; // Ignore if scrolled down
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current < 0 || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      if (diff > 0 && window.scrollY === 0) {
        // Prevent default scrolling behavior while pulling
        if (e.cancelable) e.preventDefault();
        
        setIsPulling(true);
        // Add resistance
        setPullY(Math.min(diff * 0.4, 80));
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return;

      if (pullY >= 60) {
        setIsRefreshing(true);
        setPullY(60); // Hold at refresh position

        try {
          // Re-fetch all active react-query data
          await queryClient.invalidateQueries();
        } catch (error) {
          console.error("Erreur lors de l'actualisation", error);
        } finally {
          setIsRefreshing(false);
          setIsPulling(false);
          setPullY(0);
        }
      } else {
        // Cancel pull
        setIsPulling(false);
        setPullY(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, pullY, queryClient]);

  return (
    <>
      {/* Visual Indicator for Pull to Refresh */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 w-full flex justify-center z-50 pointer-events-none transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateY(${isRefreshing ? 60 : pullY}px)`,
            opacity: Math.min(pullY / 60, 1),
            marginTop: '-40px'
          }}
        >
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center justify-center">
            <Loader2 
              className={`h-6 w-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`} 
              style={{ transform: !isRefreshing ? `rotate(${pullY * 2}deg)` : '' }}
            />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className={isPulling || isRefreshing ? "transition-transform duration-300 ease-out min-h-screen" : "min-h-screen"}
        style={(isPulling || isRefreshing) ? { transform: `translateY(${isRefreshing ? 60 : pullY}px)` } : undefined}
      >
        {children}
      </div>
    </>
  );
};

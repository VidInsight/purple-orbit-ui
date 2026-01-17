import { useEffect, useState, useRef } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  isVisible?: boolean;
}

export const useCountUp = ({
  start = 0,
  end,
  duration = 2000,
  delay = 0,
  suffix = '',
  prefix = '',
  decimals = 0,
  isVisible = true,
}: UseCountUpOptions) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const prevEndRef = useRef(end);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // If end value changed, reset and restart animation
    if (prevEndRef.current !== end) {
      setCount(start);
      setHasStarted(false);
      prevEndRef.current = end;
      
      // Cancel any ongoing animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    if (!isVisible || hasStarted) return;

    const timeout = setTimeout(() => {
      setHasStarted(true);
      const startTime = performance.now();
      const difference = end - start;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = start + difference * easeOut;
        
        setCount(currentValue);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(end);
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible, hasStarted, start, end, duration, delay]);

  const formattedValue = `${prefix}${count.toFixed(decimals)}${suffix}`;
  
  return { count, formattedValue };
};

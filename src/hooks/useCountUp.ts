import { useEffect, useState } from 'react';

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

  useEffect(() => {
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
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isVisible, hasStarted, start, end, duration, delay]);

  const formattedValue = `${prefix}${count.toFixed(decimals)}${suffix}`;
  
  return { count, formattedValue };
};

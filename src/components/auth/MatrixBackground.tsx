import { useEffect, useRef } from 'react';

export const MatrixBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    const fps = 30;
    const frameInterval = 1000 / fps;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resizeCanvas();

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / (fontSize * (window.devicePixelRatio || 1)));
    const drops: Array<{ y: number; speed: number; opacity: number; char: string }> = [];

    // Initialize drops with varied properties
    for (let i = 0; i < columns; i++) {
      drops.push({
        y: Math.random() * -100,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        char: characters[Math.floor(Math.random() * characters.length)],
      });
    }

    const draw = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }
      lastTime = currentTime;

      // Enhanced fade effect
      ctx.fillStyle = 'rgba(17, 19, 24, 0.05)';
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
      ctx.textAlign = 'center';

      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        const x = i * fontSize;
        
        // Gradient effect - brighter at top, fading down
        const gradient = ctx.createLinearGradient(x, 0, x, drop.y * fontSize + fontSize);
        const baseOpacity = drop.opacity;
        gradient.addColorStop(0, `hsla(250, 90%, 68%, ${baseOpacity * 0.8})`);
        gradient.addColorStop(0.5, `hsla(250, 90%, 68%, ${baseOpacity * 0.6})`);
        gradient.addColorStop(1, `hsla(250, 90%, 68%, ${baseOpacity * 0.2})`);
        
        ctx.fillStyle = gradient;
        ctx.fillText(drop.char, x + fontSize / 2, drop.y * fontSize);

        // Update drop position
        drop.y += drop.speed * 0.5;

        // Reset drop when it goes off screen
        if (drop.y * fontSize > canvas.height / (window.devicePixelRatio || 1) + 50) {
          drop.y = Math.random() * -50;
          drop.speed = Math.random() * 2 + 1;
          drop.opacity = Math.random() * 0.5 + 0.2;
          drop.char = characters[Math.floor(Math.random() * characters.length)];
        }

        // Occasionally change character for more dynamic effect
        if (Math.random() > 0.95) {
          drop.char = characters[Math.floor(Math.random() * characters.length)];
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      resizeCanvas();
      // Reinitialize drops for new column count
      const newColumns = Math.floor(canvas.width / (fontSize * (window.devicePixelRatio || 1)));
      drops.length = 0;
      for (let i = 0; i < newColumns; i++) {
        drops.push({
          y: Math.random() * -100,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          char: characters[Math.floor(Math.random() * characters.length)],
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 0 }}
    />
  );
};

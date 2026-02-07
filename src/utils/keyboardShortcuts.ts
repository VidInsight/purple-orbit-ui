import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed
      const isCmdOrCtrl = event.metaKey || event.ctrlKey;

      if (!isCmdOrCtrl) return;

      // Prevent default behavior for our shortcuts
      const shortcuts: Record<string, () => void> = {
        'd': () => {
          event.preventDefault();
          navigate('/dashboard');
        },
        'w': () => {
          event.preventDefault();
          navigate('/workflows');
        },
        'e': () => {
          event.preventDefault();
          navigate('/executions');
        },
        'k': () => {
          event.preventDefault();
          // Command palette would go here
        },
      };

      const handler = shortcuts[event.key.toLowerCase()];
      if (handler) {
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};

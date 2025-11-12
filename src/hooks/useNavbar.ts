import { useState, useEffect } from 'react';

const NAVBAR_STORAGE_KEY = 'navbar-collapsed';

export const useNavbar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(NAVBAR_STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(NAVBAR_STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  return { isCollapsed, toggleCollapsed };
};

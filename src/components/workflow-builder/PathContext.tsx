import { createContext, useContext, useState, ReactNode } from 'react';

interface PathContextType {
  activePath: string | null;
  setActivePath: (path: string | null) => void;
  targetParameterId: string | null;
  setTargetParameterId: (id: string | null) => void;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export const PathProvider = ({ children }: { children: ReactNode }) => {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [targetParameterId, setTargetParameterId] = useState<string | null>(null);

  return (
    <PathContext.Provider
      value={{
        activePath,
        setActivePath,
        targetParameterId,
        setTargetParameterId,
      }}
    >
      {children}
    </PathContext.Provider>
  );
};

export const usePathContext = () => {
  const context = useContext(PathContext);
  if (!context) {
    throw new Error('usePathContext must be used within PathProvider');
  }
  return context;
};

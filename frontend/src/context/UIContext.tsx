"use client";

import React, { createContext, useContext, useState } from 'react';

interface UIContextType {
  isSidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

const UIContext = createContext<UIContextType>({
  isSidebarVisible: true,
  setSidebarVisible: () => {}
});

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarVisible(false);
    }
  }, []);

  return (
    <UIContext.Provider value={{ isSidebarVisible, setSidebarVisible }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);

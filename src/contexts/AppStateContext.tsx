'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AppState {
  imageHovered: boolean;
  menuOpen: boolean;
  mobileMenuOpen: boolean;
}

interface AppStateContextType extends AppState {
  setImageHovered: (value: boolean) => void;
  setMenuOpen: (value: boolean) => void;
  setMobileMenuOpen: (value: boolean) => void;
  toggleMenu: () => void;
  toggleMobileMenu: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [imageHovered, setImageHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const value: AppStateContextType = {
    imageHovered,
    menuOpen,
    mobileMenuOpen,
    setImageHovered,
    setMenuOpen,
    setMobileMenuOpen,
    toggleMenu,
    toggleMobileMenu,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
} 
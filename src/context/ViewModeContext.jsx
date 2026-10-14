import React, { createContext, useContext, useMemo, useCallback } from 'react';

const ViewModeContext = createContext();

export function ViewModeProvider({ children }) {
  // PulsePath is strictly Mobile-First PWA/App view.
  // Desktop layout considerations are completely eliminated.
  const viewMode = 'mobile';
  const isMobileView = true;

  const setViewMode = useCallback(() => {
    // No-op: strictly mobile-only
  }, []);

  const toggleViewMode = useCallback(() => {
    // No-op: strictly mobile-only
  }, []);

  const value = useMemo(
    () => ({ viewMode, setViewMode, toggleViewMode, isMobileView }),
    [viewMode, setViewMode, toggleViewMode, isMobileView]
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}

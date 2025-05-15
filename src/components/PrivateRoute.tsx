import React from 'react';

// Simplified to always render children without auth check
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
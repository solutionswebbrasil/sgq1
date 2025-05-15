import React, { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

// Simplified auth context that simulates a logged-in user
const defaultAuthState = {
  user: { id: 'default-user-id' },
  loading: false,
  // Keep these functions as no-ops to avoid having to refactor components using them
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext(defaultAuthState);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={defaultAuthState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
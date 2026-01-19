import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if we have a token stored
    return !!localStorage.getItem('auth_token');
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Try to fetch current user to validate token
        const result = await api.getCurrentUser();
        if (result.error) {
          // Token is invalid, clear it
          api.logout();
          setIsAuthenticated(false);
        }
      }
    };
    validateToken();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Call real backend API
      const result = await api.login(username, password);
      
      if (result.data && result.data.access_token) {
        // Token is already stored by api.login()
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

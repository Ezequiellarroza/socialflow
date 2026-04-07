// =====================================================
// SOCIALFLOW - Auth Context
// =====================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, LoginCredentials } from '../types';
import authService from '../services/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar sesión al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      if (!localStorage.getItem('sf_token')) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await authService.me();
        setUser(currentUser);
      } catch (err) {
        console.error('Error verificando sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
      // Cargar datos completos (plan, límites, aprobaciones) desde me.php
      const fullUser = await authService.me();
      if (fullUser) setUser(fullUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;

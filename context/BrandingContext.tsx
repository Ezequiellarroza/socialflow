// =====================================================
// SOCIALFLOW - Branding Context
// =====================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import brandingService, { AgenciaBranding } from '../services/branding';

// Colores por defecto (verde esmeralda del login cliente actual)
const DEFAULT_BRANDING: AgenciaBranding = {
  id: 0,
  nombre: 'SocialFlow',
  slug: '',
  logo_url: null,
  colores: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#f59e0b',
  },
};

interface BrandingContextType {
  branding: AgenciaBranding;
  isLoading: boolean;
  error: string | null;
  loadBranding: (slug: string) => Promise<void>;
  clearBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<AgenciaBranding>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBranding = useCallback(async (slug: string) => {
    // Si ya tenemos el branding de este slug, no recargar
    if (branding.slug === slug && branding.id !== 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await brandingService.getBySlug(slug);
      setBranding(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar información de la agencia');
      setBranding(DEFAULT_BRANDING);
    } finally {
      setIsLoading(false);
    }
  }, [branding.slug, branding.id]);

  const clearBranding = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
    setError(null);
  }, []);

  const value: BrandingContextType = {
    branding,
    isLoading,
    error,
    loadBranding,
    clearBranding,
  };

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding debe usarse dentro de un BrandingProvider');
  }
  return context;
};

export default BrandingContext;
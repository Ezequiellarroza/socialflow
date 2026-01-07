// =====================================================
// SOCIALFLOW - Branding Service
// =====================================================

import api from './api';

export interface AgenciaBranding {
  id: number;
  nombre: string;
  slug: string;
  logo_url: string | null;
  colores: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

export const brandingService = {
  /**
   * Obtener branding público de una agencia por slug
   * NO requiere autenticación
   */
  async getBySlug(slug: string): Promise<AgenciaBranding> {
    const response = await api.get<AgenciaBranding>(`/agencias.php?slug=${encodeURIComponent(slug)}`);

    if (!response.data) {
      throw { message: 'Agencia no encontrada' };
    }

    return response.data;
  },
};

export default brandingService;
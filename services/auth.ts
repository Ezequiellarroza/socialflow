// =====================================================
// SOCIALFLOW - Auth Service
// =====================================================

import api from './api';
import { AuthUser, LoginCredentials } from '../types';

interface LoginResponse {
  user: AuthUser;
}

interface MeResponse {
  user: AuthUser;
}

export const authService = {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await api.post<LoginResponse>('/auth/login.php', {
      email: credentials.email,
      password: credentials.password,
      user_type: credentials.user_type || 'agencia',
    });

    if (!response.data?.user) {
      throw { message: 'Respuesta inválida del servidor' };
    }

    return response.data.user;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout.php', {});
    } catch (error) {
      // Ignorar errores de logout, limpiar estado local de todos modos
      console.warn('Error en logout:', error);
    }
  },

  /**
   * Verificar sesión actual (llamar al cargar la app)
   */
  async me(): Promise<AuthUser | null> {
    try {
      const response = await api.get<MeResponse>('/auth/me.php');
      return response.data?.user || null;
    } catch (error: any) {
      // 401 = no autenticado, es esperado
      if (error.status === 401) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Refrescar token
   */
  async refresh(): Promise<boolean> {
    try {
      await api.post('/auth/refresh.php', {});
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;

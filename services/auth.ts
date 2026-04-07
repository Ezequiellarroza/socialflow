// =====================================================
// SOCIALFLOW - Auth Service
// =====================================================

import api from './api';
import { AuthUser, LoginCredentials } from '../types';

interface LoginResponse {
  token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

interface RefreshResponse {
  token: string;
  refresh_token: string;
  expires_in: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://socialflow.com.ar/api';

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

    if (!response.data?.user || !response.data?.token) {
      throw { message: 'Respuesta inválida del servidor' };
    }

    localStorage.setItem('sf_token', response.data.token);
    localStorage.setItem('sf_refresh_token', response.data.refresh_token);
    localStorage.setItem('sf_expires_in', String(response.data.expires_in || 900));
    localStorage.setItem('sf_token_saved_at', String(Date.now()));

    return response.data.user;
  },

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_refresh_token');
    localStorage.removeItem('sf_expires_in');
    localStorage.removeItem('sf_token_saved_at');
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
      const refreshToken = localStorage.getItem('sf_refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const json = await response.json();
      const data: RefreshResponse | undefined = json.data;

      if (data?.token && data?.refresh_token) {
        localStorage.setItem('sf_token', data.token);
        localStorage.setItem('sf_refresh_token', data.refresh_token);
        localStorage.setItem('sf_expires_in', String(data.expires_in || 900));
        localStorage.setItem('sf_token_saved_at', String(Date.now()));
        return true;
      }
      return false;
    } catch {
      localStorage.removeItem('sf_token');
      localStorage.removeItem('sf_refresh_token');
      localStorage.removeItem('sf_expires_in');
      localStorage.removeItem('sf_token_saved_at');
      return false;
    }
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('sf_refresh_token');
  },

  isTokenExpiringSoon(): boolean {
    const savedAt = localStorage.getItem('sf_token_saved_at');
    const expiresIn = localStorage.getItem('sf_expires_in');
    if (!savedAt || !expiresIn) return false;

    const expiresAt = Number(savedAt) + Number(expiresIn) * 1000;
    return Date.now() > expiresAt - 60000;
  },
};

export default authService;

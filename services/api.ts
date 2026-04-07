// =====================================================
// SOCIALFLOW - API Service
// =====================================================

import authService from './auth';

export const API_URL = import.meta.env.VITE_API_URL || 'https://socialflow.com.ar/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<ApiResponse<T>> {
    // Refresh proactivo: si el token está por expirar, renovar antes del request
    if (!_isRetry && localStorage.getItem('sf_token') && authService.isTokenExpiringSoon()) {
      await this.handleRefresh();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('sf_token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Intentar parsear JSON
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch {
        data = { error: 'Error al procesar la respuesta del servidor' };
      }

      // Manejar 401 antes de lanzar error genérico
      // Excepción: endpoints públicos (branding) no deben forzar logout
      if (response.status === 401 && !endpoint.includes('/branding/')) {
        if (data.error === 'token_expired') {
          if (!_isRetry) {
            const refreshed = await this.handleRefresh();
            if (refreshed) {
              return this.request<T>(endpoint, options, true);
            }
          }
          this.forceLogout();
          throw { status: 401, message: 'Sesión expirada' };
        }

        if (data.error === 'invalid_token' || data.error === 'refresh_expired') {
          this.forceLogout();
          throw { status: 401, message: 'Sesión expirada' };
        }
      }

      // Si la respuesta no es OK, lanzar error
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || data.message || 'Error en la solicitud',
          errors: data.errors,
        };
      }

      return data;
    } catch (error: any) {
      // Si ya es un error formateado, re-lanzar
      if (error.status) {
        throw error;
      }
      // Error de red u otro
      throw {
        status: 0,
        message: 'Error de conexión. Verifica tu internet.',
      };
    }
  }

  private async handleRefresh(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = authService.refresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private forceLogout(): void {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_refresh_token');
    localStorage.removeItem('sf_expires_in');
    localStorage.removeItem('sf_token_saved_at');
    window.location.href = '/#/login';
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService(API_URL);
export default api;

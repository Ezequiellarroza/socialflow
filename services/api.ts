// =====================================================
// SOCIALFLOW - API Service
// =====================================================

const API_URL = import.meta.env.VITE_API_URL || 'https://socialflow.com.ar/api';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Importante para cookies HTTPOnly
      headers: {
        'Content-Type': 'application/json',
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

// =====================================================
// SOCIALFLOW - Clientes Service
// =====================================================

import api from './api';

export interface ClienteAPI {
  id: number;
  nombre_cliente: string;
  email: string;
  empresa?: string;
  telefono?: string;
  notas?: string;
  activo: boolean | number;  // MODIFICAR - puede venir como 0/1
  created_at: string;
  updated_at: string;
  stats?: {           // AGREGAR
    pendientes: number;
    total: number;
  };
}

export interface CreateClienteData {
  nombre_cliente: string;
  email: string;
  password: string;  // AGREGAR
  empresa?: string;
  telefono?: string;
  notas?: string;
}

export interface UpdateClienteData {
  nombre_cliente?: string;
  email?: string;
  password?: string;  // AGREGAR
  empresa?: string;
  telefono?: string;
  notas?: string;
  activo?: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface ClientesListResponse {
  clientes: ClienteAPI[];
  pagination: PaginationInfo;
}

export const clientesService = {
  /**
   * Obtener todos los clientes
   */
  async getAll(params?: { page?: number; per_page?: number; search?: string }): Promise<ClientesListResponse> {
    let endpoint = '/clientes.php';
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }

    const response = await api.get<any>(endpoint);
    const data = response.data;
    
    return {
      clientes: Array.isArray(data) ? data : (data?.clientes || []),
      pagination: response.data?.pagination || { total: 0, page: 1, per_page: 20, total_pages: 0 }
    };
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id: number): Promise<ClienteAPI | null> {
    const response = await api.get<any>(`/clientes.php?id=${id}`);
    return response.data || null;
  },

  /**
   * Crear nuevo cliente
   */
  async create(data: CreateClienteData): Promise<ClienteAPI> {
    const response = await api.post<any>('/clientes.php', data);
    
    if (response.data?.id) {
      return response.data;
    }
    
    throw { message: response.error || 'Error al crear cliente' };
  },

  /**
   * Actualizar cliente
   */
  async update(id: number, data: UpdateClienteData): Promise<ClienteAPI> {
    const response = await api.put<any>(`/clientes.php?id=${id}`, data);
    
    if (response.data?.id) {
      return response.data;
    }
    
    throw { message: response.error || 'Error al actualizar cliente' };
  },

  /**
   * Eliminar cliente
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/clientes.php?id=${id}`);
  },
};

export default clientesService;
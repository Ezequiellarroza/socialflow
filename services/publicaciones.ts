// =====================================================
// SOCIALFLOW - Publicaciones Service
// =====================================================

import api from './api';

export type RedSocial = 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
export type TipoContenido = 'imagen' | 'video' | 'carrusel' | 'story' | 'reel';
export type EstadoPublicacion = 'pendiente' | 'aprobado' | 'modificar' | 'rechazado';

export interface PublicacionAPI {
  id: number;
  calendario_id: number;
  titulo?: string;
  red_social: RedSocial;
  tipo_contenido: TipoContenido;
  fecha_programada: string;
  copy?: string;
  media_url?: string;
  media_type?: string;
  estado: EstadoPublicacion;
  version: number;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePublicacionData {
  calendario_id: number;
  titulo?: string;
  red_social: RedSocial;
  tipo_contenido: TipoContenido;
  fecha_programada: string;
  copy?: string;
  media_url?: string;
  media_type?: string;
}

export interface UpdatePublicacionData {
  titulo?: string;
  red_social?: RedSocial;
  tipo_contenido?: TipoContenido;
  fecha_programada?: string;
  copy?: string;
  media_url?: string;
  media_type?: string;
  estado?: EstadoPublicacion;
  orden?: number;
}

export const publicacionesService = {
  /**
   * Obtener publicaciones (con filtros opcionales)
   */
  async getAll(params?: { 
    calendario_id?: number; 
    estado?: EstadoPublicacion;
    red_social?: RedSocial;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Promise<PublicacionAPI[]> {
    let endpoint = '/publicaciones.php';
    const queryParams = new URLSearchParams();
    
    if (params?.calendario_id) queryParams.append('calendario_id', params.calendario_id.toString());
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.red_social) queryParams.append('red_social', params.red_social);
    if (params?.fecha_desde) queryParams.append('fecha_desde', params.fecha_desde);
    if (params?.fecha_hasta) queryParams.append('fecha_hasta', params.fecha_hasta);
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }

    const response = await api.get<any>(endpoint);
    const data = response.data;
    
    // Caso: { data: [...] }
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  },

  /**
   * Obtener una publicación por ID
   */
  async getById(id: number): Promise<PublicacionAPI | null> {
    const response = await api.get<any>(`/publicaciones.php?id=${id}`);
    return response.data || null;
  },

  /**
   * Crear nueva publicación
   */
  async create(data: CreatePublicacionData): Promise<PublicacionAPI> {
    const response = await api.post<any>('/publicaciones.php', data);
    const respData = response.data;
    
    // Si data es array, tomar el primero
    if (Array.isArray(respData) && respData.length > 0) {
      return respData[0];
    }
    // Si data es objeto con id
    if (respData?.id) {
      return respData;
    }
    
    throw { message: response.error || 'Error al crear publicación' };
  },

  /**
   * Actualizar publicación
   */
  async update(id: number, data: UpdatePublicacionData): Promise<PublicacionAPI> {
    const response = await api.put<any>(`/publicaciones.php?id=${id}`, data);
    
    if (response.data?.id) {
      return response.data;
    }
    
    throw { message: response.error || 'Error al actualizar publicación' };
  },

  /**
   * Aprobar publicación
   */
  async aprobar(id: number): Promise<PublicacionAPI> {
    return this.update(id, { estado: 'aprobado' });
  },

  /**
   * Solicitar modificación
   */
  async solicitarModificacion(id: number): Promise<PublicacionAPI> {
    return this.update(id, { estado: 'modificar' });
  },

  /**
   * Rechazar publicación
   */
  async rechazar(id: number): Promise<PublicacionAPI> {
    return this.update(id, { estado: 'rechazado' });
  },

  /**
   * Eliminar publicación
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/publicaciones.php?id=${id}`);
  },
};

export default publicacionesService;
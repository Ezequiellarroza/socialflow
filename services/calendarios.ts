// =====================================================
// SOCIALFLOW - Calendarios Service
// =====================================================

import api from './api';

export interface CalendarioAPI {
  id: number;
  cliente_id: number;
  mes: number;
  anio: number;
  estado_general: 'borrador' | 'enviado' | 'aprobado' | 'cerrado';
  fecha_envio?: string;
  created_at: string;
  updated_at?: string;
  cliente_nombre?: string;
  cliente_empresa?: string;
}

export interface CreateCalendarioData {
  cliente_id: number;
  mes: number;
  anio: number;
}

export interface UpdateCalendarioData {
  estado_general?: 'borrador' | 'enviado' | 'aprobado' | 'cerrado';
}

export const calendariosService = {
  /**
   * Obtener todos los calendarios
   */
  async getAll(params?: { cliente_id?: number; mes?: number; anio?: number }): Promise<CalendarioAPI[]> {
    let endpoint = '/calendarios.php';
    const queryParams = new URLSearchParams();
    
    if (params?.cliente_id) queryParams.append('cliente_id', params.cliente_id.toString());
    if (params?.mes) queryParams.append('mes', params.mes.toString());
    if (params?.anio) queryParams.append('anio', params.anio.toString());
    
    if (queryParams.toString()) {
      endpoint += `?${queryParams.toString()}`;
    }

    const response = await api.get<any>(endpoint);
    const data = response.data;
    
    // Caso: { data: { calendario: {...} | null } } - calendario específico
    if (data?.calendario !== undefined) {
      return data.calendario ? [data.calendario] : [];
    }

    // Caso: { data: { calendarios: [...] } } - lista de calendarios
    if (data?.calendarios !== undefined) {
      return data.calendarios;
    }
    
    // Caso: { data: [...] }
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  },

  /**
   * Obtener un calendario por ID
   */
  async getById(id: number): Promise<CalendarioAPI | null> {
    const response = await api.get<any>(`/calendarios.php?id=${id}`);
    return response.data?.calendario || response.data || null;
  },

  /**
   * Crear nuevo calendario
   */
  async create(data: CreateCalendarioData): Promise<CalendarioAPI> {
    const response = await api.post<any>('/calendarios.php', data);
    
    if (response.data?.id) {
      return response.data;
    }
    
    throw { message: response.error || 'Error al crear calendario' };
  },

  /**
   * Actualizar calendario
   */
  async update(id: number, data: UpdateCalendarioData): Promise<CalendarioAPI> {
    const response = await api.put<any>(`/calendarios.php?id=${id}`, data);
    
    if (response.data?.id) {
      return response.data;
    }
    
    throw { message: response.error || 'Error al actualizar calendario' };
  },

  /**
   * Enviar calendario al cliente para aprobación
   */
  async enviarParaAprobacion(id: number): Promise<CalendarioAPI> {
    return this.update(id, { estado_general: 'enviado' });
  },

  /**
   * Eliminar calendario
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/calendarios.php?id=${id}`);
  },
};

export default calendariosService;
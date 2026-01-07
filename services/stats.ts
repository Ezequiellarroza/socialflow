// =====================================================
// SOCIALFLOW - Stats Service (Agencia)
// =====================================================

import api from './api';

export interface AgenciaStats {
  resumen: {
    total_clientes: number;
    clientes_activos: number;
    pendientes_aprobacion: number;
    requieren_modificacion: number;
    publicaciones_hoy: number;
    aprobadas: number;
  };
  clientes: ClienteResumen[];
  feedback_reciente: FeedbackReciente[];
}

export interface ClienteResumen {
  id: number;
  nombre_cliente: string;
  empresa: string | null;
  activo: number;
  total_calendarios: number;
  pendientes: number;
  requieren_modificacion: number;
  aprobadas: number;
  proxima_publicacion: string | null;
}

export interface FeedbackReciente {
  id: number;
  comentario: string;
  created_at: string;
  publicacion_id: number;
  publicacion_titulo: string;
  red_social: string;
  nombre_cliente: string;
}

export const statsService = {
  /**
   * Obtener estadísticas del dashboard de agencia
   */
  async getAgenciaStats(): Promise<AgenciaStats> {
    const response = await api.get<AgenciaStats>('/stats.php');
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Error al obtener estadísticas');
  }
};

export default statsService;
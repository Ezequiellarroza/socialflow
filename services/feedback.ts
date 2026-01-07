// =====================================================
// SOCIALFLOW - Feedback Service
// =====================================================

import api from './api';

export interface FeedbackAPI {
  id: number;
  publicacion_id: number;
  autor_id: number;
  tipo_autor: 'agencia' | 'cliente';
  comentario: string;
  accion: 'comentario' | 'aprobar' | 'modificar' | 'rechazar';
  estado_anterior: string | null;
  estado_nuevo: string | null;
  created_at: string;
  autor_nombre: string;
  autor_avatar?: string;
}

export interface CreateFeedbackData {
  publicacion_id: number;
  comentario: string;
  accion?: 'comentario' | 'aprobar' | 'modificar' | 'rechazar';
}

export const feedbackService = {
  /**
   * Obtener feedback de una publicación
   */
  async getByPublicacion(publicacionId: number): Promise<FeedbackAPI[]> {
    const response = await api.get<FeedbackAPI[]>(`/feedback.php?publicacion_id=${publicacionId}`);
    return response.data || [];
  },

  /**
   * Crear nuevo feedback/comentario
   */
  async create(data: CreateFeedbackData): Promise<FeedbackAPI> {
    const response = await api.post<FeedbackAPI>('/feedback.php', data);
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Error al crear feedback');
  }
};

export default feedbackService;
// =====================================================
// SOCIALFLOW - Notificaciones Service
// =====================================================

import api from './api';

export interface NotificarClienteResponse {
  notificados: number;
}

const notificacionesService = {
  async notificarCliente(clienteId: number): Promise<NotificarClienteResponse> {
    const response = await api.post<NotificarClienteResponse>('/notificaciones.php', { cliente_id: clienteId });

    if (response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Error al enviar notificación');
  }
};

export default notificacionesService;

// =====================================================
// SOCIALFLOW - Services Index
// =====================================================

export { default as api } from './api';
export { default as authService } from './auth';
export { default as clientesService } from './clientes';
export { default as calendariosService } from './calendarios';
export { default as publicacionesService } from './publicaciones';
export { default as notificacionesService } from './notificaciones';

// Re-export types
export type { ClienteAPI, CreateClienteData, UpdateClienteData } from './clientes';
export type { CalendarioAPI, CreateCalendarioData, UpdateCalendarioData } from './calendarios';
export type { 
  PublicacionAPI, 
  CreatePublicacionData, 
  UpdatePublicacionData,
  RedSocial,
  TipoContenido,
  EstadoPublicacion 
} from './publicaciones';

/**
 * Socialflow - Admin Service
 * Servicios para el panel de Super Admin
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://socialflow.com.ar/api';

// ============ ESTADÍSTICAS ============
export interface AdminStats {
  resumen: {
    total_agencias: number;
    agencias_activas: number;
    agencias_inactivas: number;
    agencias_vencidas: number;
    total_clientes: number;
    total_publicaciones: number;
  };
  ingresos: {
    total: number;
    mes_actual: number;
    pendientes_cantidad: number;
    pendientes_monto: number;
  };
  agencias_por_plan: { plan: string; total: number }[];
  publicaciones_por_estado: { estado: string; total: number }[];
  ultimas_agencias: { id: number; nombre_agencia: string; plan: string; created_at: string }[];
  ultimos_pagos: { id: number; monto: number; moneda: string; estado: string; created_at: string; nombre_agencia: string }[];
  actividad_mensual: { mes: string; publicaciones: number }[];
  agencias_por_mes: { mes: string; nuevas: number }[];
}

export const getStats = async (): Promise<AdminStats> => {
  const res = await fetch(`${API_URL}/admin/stats.php`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al obtener estadísticas');
  return json.data;
};

// ============ AGENCIAS ============
export interface Agencia {
  id: number;
  nombre_agencia: string;
  slug: string;
  email_contacto: string;
  plan: string;
  activa: number;
  max_clientes: number;
  max_publicaciones_mes: number;
  fecha_vencimiento_plan: string | null;
  ultimo_pago: string | null;
  created_at: string;
  total_clientes?: number;
  total_publicaciones?: number;
  total_usuarios?: number;
  ultimos_pagos?: Pago[];
}

export const getAgencias = async (): Promise<Agencia[]> => {
  const res = await fetch(`${API_URL}/admin/agencias.php`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al obtener agencias');
  return json.data;
};

export const getAgencia = async (id: number): Promise<Agencia> => {
  const res = await fetch(`${API_URL}/admin/agencias.php?id=${id}`, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al obtener agencia');
  return json.data;
};

export const updateAgencia = async (id: number, data: Partial<Agencia>): Promise<void> => {
  const res = await fetch(`${API_URL}/admin/agencias.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al actualizar agencia');
};

// ============ PAGOS ============
export interface Pago {
  id: number;
  agencia_id: number;
  nombre_agencia?: string;
  monto: number;
  moneda: string;
  estado: string;
  fecha_pago: string | null;
  fecha_vencimiento: string;
  metodo_pago: string | null;
  referencia: string | null;
  notas: string | null;
  created_at: string;
}

export const getPagos = async (filtros?: { agencia_id?: number; estado?: string }): Promise<Pago[]> => {
  let url = `${API_URL}/admin/pagos.php`;
  if (filtros) {
    const params = new URLSearchParams();
    if (filtros.agencia_id) params.append('agencia_id', String(filtros.agencia_id));
    if (filtros.estado) params.append('estado', filtros.estado);
    if (params.toString()) url += `?${params.toString()}`;
  }
  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al obtener pagos');
  return json.data;
};

export const createPago = async (data: {
  agencia_id: number;
  monto: number;
  moneda?: string;
  estado?: string;
  fecha_vencimiento: string;
  metodo_pago?: string;
  referencia?: string;
  notas?: string;
}): Promise<number> => {
  const res = await fetch(`${API_URL}/admin/pagos.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al crear pago');
  return json.data.id;
};

export const updatePago = async (id: number, data: Partial<Pago>): Promise<void> => {
  const res = await fetch(`${API_URL}/admin/pagos.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error al actualizar pago');
};

export const adminService = {
  getStats,
  getAgencias,
  getAgencia,
  updateAgencia,
  getPagos,
  createPago,
  updatePago
};

export default adminService;
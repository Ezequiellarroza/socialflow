// =====================================================
// SOCIALFLOW - Types
// =====================================================

// =====================================================
// AUTH TYPES
// =====================================================

export type UserType = 'agencia' | 'cliente' | 'super_admin';
export type UserRole = 'admin' | 'editor' | 'viewer' | 'cliente' | 'super_admin';

export interface PlanLimits {
  max_clientes: number;
  max_publicaciones_mes: number;
}

export interface PlanUsage {
  clientes: number;
  publicaciones_mes: number;
}

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  user_type: UserType;
  rol: UserRole;
  agencia_id: number | null;
  slug?: string;
  logo_url?: string;
  empresa?: string;
  plan?: string;
  plan_limits?: PlanLimits;
  plan_usage?: PlanUsage;
  pendientes_aprobacion?: number;
  requieren_modificacion?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  user_type?: UserType;
}

// =====================================================
// CLIENT TYPES
// =====================================================

export interface Client {
  id: string;
  name: string;
  industry: string;
  logo: string;
  status: 'active' | 'pending' | 'urgent';
  pendingPosts: number;
}

// =====================================================
// USER TYPES (Legacy - para UI)
// =====================================================

export interface User {
  name: string;
  role: string;
  avatar: string;
}
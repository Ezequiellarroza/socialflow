// =====================================================
// SOCIALFLOW - Types
// =====================================================

// =====================================================
// AUTH TYPES
// =====================================================

export type UserType = 'agencia' | 'cliente' | 'super_admin';
export type UserRole = 'admin' | 'editor' | 'viewer' | 'cliente' | 'super_admin';

export interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  user_type: UserType;
  rol: UserRole;
  agencia_id: number | null;
  slug?: string;      // AGREGAR
  logo_url?: string;  // AGREGAR (ya viene pero no estaba tipado)
}

export interface LoginCredentials {
  email: string;
  password: string;
  user_type?: UserType;
}

// =====================================================
// POST TYPES
// =====================================================

export enum PostStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SCHEDULED = 'SCHEDULED'
}

export enum PostFormat {
  IMAGE = 'IMAGE',
  CAROUSEL = 'CAROUSEL',
  VIDEO = 'VIDEO'
}

export interface Post {
  id: string;
  clientId: string;
  title: string;
  content: string;
  status: PostStatus;
  format: PostFormat;
  date: string;
  time: string;
  image?: string;
  hashtags?: string[];
  feedback?: string;
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
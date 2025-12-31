
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

export interface Client {
  id: string;
  name: string;
  industry: string;
  logo: string;
  status: 'active' | 'pending' | 'urgent';
  pendingPosts: number;
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

export interface User {
  name: string;
  role: string;
  avatar: string;
}

export interface Avatar {
  id: string;
  name: string;
  role: string;
  image: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
}

export interface Generation {
  id: string;
  avatarId: string;
  script: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  duration?: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export type ViewState = 'login' | 'avatars' | 'script' | 'history' | 'credits';

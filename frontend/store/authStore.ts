import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof globalThis.window !== 'undefined' ? JSON.parse(localStorage.getItem('user_data') || 'null') : null,
  token: typeof globalThis.window !== 'undefined' ? localStorage.getItem('access_token') : null,
  isAuthenticated: typeof globalThis.window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
  isAdmin: typeof globalThis.window !== 'undefined' ? (JSON.parse(localStorage.getItem('user_data') || 'null')?.roles || []).some((r: string) => r.toLowerCase() === 'admin') : false,
  
  setUser: (user) => {
    if (typeof globalThis.window !== 'undefined') {
      if (user) {
        localStorage.setItem('user_data', JSON.stringify(user));
      } else {
        localStorage.removeItem('user_data');
      }
    }
    set({
      user,
      isAdmin: user?.roles?.some((r: string) => r.toLowerCase() === 'admin') || false
    });
  },
  
  setToken: (token) => {
    if (typeof globalThis.window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
    set({
      token,
      isAuthenticated: !!token
    });
  },
  
  logout: () => {
    if (typeof globalThis.window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false
    });
  }
}));

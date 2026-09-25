import { api } from './api';
import { useAuthStore } from '@/store/authStore';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(data: RegisterPayload) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(data: LoginPayload) {
    const res = await api.post('/auth/login', data);
    const { access_token, user } = res.data;
    useAuthStore.getState().setToken(access_token);
    useAuthStore.getState().setUser(user);
    return res.data;
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    useAuthStore.getState().setUser(res.data);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    useAuthStore.getState().logout();
  }
};

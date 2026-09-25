import axios from 'axios';

declare const process: { env?: { [key: string]: string | undefined } };

let rawApiUrl = (typeof globalThis.process !== 'undefined' && globalThis.process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:8000';
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_URL = rawApiUrl;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof globalThis.window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof globalThis.window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        if (!globalThis.location.pathname.startsWith('/login') && !globalThis.location.pathname.startsWith('/register')) {
          globalThis.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

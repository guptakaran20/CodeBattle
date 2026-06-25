import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 403 && error.response.data?.errorCode === 'AUTH_008') {
      toast.error('Verification Required', {
        description: 'You must link your Google account to perform this action.',
        action: {
          label: 'Verify Now',
          onClick: () => window.location.href = '/verify',
        },
      });
      return Promise.reject(error);
    }
    
    // Basic automatic refresh mechanism
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/register'
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

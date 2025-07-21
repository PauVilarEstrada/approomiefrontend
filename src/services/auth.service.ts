import { api } from '../api/api';

export const register = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyEmail = async (data: { email: string; code: string }) => {
  const response = await api.post('/auth/verify', data);
  return response.data;
};

export const login = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/me');
  return response.data.user;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

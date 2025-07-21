import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export const api = axios.create({ baseURL: API_URL });

// Interceptor para añadir el Bearer token en cada petición
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL não foi configurada.');
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o Token JWT em todas as requisições
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('@BarberPro:token');
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (err) {
    console.error('Erro ao recuperar token do AsyncStorage:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
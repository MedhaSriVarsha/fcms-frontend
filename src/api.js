import axios from 'axios';

const API = axios.create({
  baseURL: 'https://fcms-backend.onrender.com/api',
});

API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('fcms_user');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
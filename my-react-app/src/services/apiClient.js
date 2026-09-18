// src/services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // 🔍 Let's see what keys actually exist in localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('firebaseToken');
    console.log("🔍 [ApiClient Interceptor] Token found in localStorage:", token ? token.substring(0, 15) + "..." : "❌ NULL / EMPTY");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
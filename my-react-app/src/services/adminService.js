// frontend/src/services/adminService.js
import apiClient from './apiClient';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  // Default to 'admin321' if no custom passcode is saved in localStorage
  const passcode = localStorage.getItem('adminPasscode') || 'admin321';
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'x-admin-passcode': passcode,
    },
  };
};

export const adminService = {
  getAllLevels: async () => {
    const response = await apiClient.get('/admin/levels', getAuthHeaders());
    return response.data;
  },

  addLevelBatch: async (payload) => {
    const response = await apiClient.post('/admin/levels', payload, getAuthHeaders());
    return response.data;
  },

  updateLevelBatch: async (levelId, payload) => {
    const response = await apiClient.put(`/admin/levels/${levelId}`, payload, getAuthHeaders());
    return response.data;
  },

  deleteLevel: async (levelId) => {
    const response = await apiClient.delete(`/admin/levels/${levelId}`, getAuthHeaders());
    return response.data;
  }
};
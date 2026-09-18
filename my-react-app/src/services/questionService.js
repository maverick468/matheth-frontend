// frontend/src/services/questionService.js (add these methods)
import apiClient from './apiClient';

export const questionService = {
  async getAvailableLevels(params) {
    // params: { subject, grade, difficulty }
    const response = await apiClient.get('/questions/levels', { params });
    return response.data.levels;
  },

  async getLevelQuestions(levelId) {
    const response = await apiClient.get(`/questions/levels/${levelId}`);
    return response.data.level;
  }
};
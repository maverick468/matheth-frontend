import apiClient from './apiClient';

export const gameService = {
  async saveScore(scoreData) {
    const response = await apiClient.post('/games/score', scoreData);
    return response.data;
  },

  async getLeaderboard() {
    const response = await apiClient.get('/games/leaderboard');
    return response.data;
  },

  async getUserStats(userId) {
    const response = await apiClient.get(`/games/stats/${userId}`);
    return response.data;
  }
};
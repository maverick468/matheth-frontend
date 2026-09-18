import { useState } from 'react';
import { gameService } from '../services/gameService';

export function useGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveScore = async (scoreData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await gameService.saveScore(scoreData);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to save score');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { saveScore, loading, error };
}
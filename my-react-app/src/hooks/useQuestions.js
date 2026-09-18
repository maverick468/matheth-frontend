import { useState, useCallback } from 'react';
import { questionService } from '../services/questionService';

export function useQuestions(initialParams) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await questionService.fetchQuestions(params || initialParams);
      setQuestions(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  return { questions, loading, error, fetchQuestions };
}
/**
 * Centralized API Configuration for AnesthAI-SafeDose
 * Supports dynamic configuration via VITE_API_URL environment variable.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('safedose_jwt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export default API_BASE_URL;

import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export function fetchInsights(token) {
  return axios.get(`${API_BASE}/insights/analyze?token=${token}`);
}
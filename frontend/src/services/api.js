import axios from 'axios';

const base = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: base,
});

export const baseApiUrl = base;

export default api;

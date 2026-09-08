import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:7050/api';
  }
  return 'https://www.sweettreeon.com/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true
});

export default api;

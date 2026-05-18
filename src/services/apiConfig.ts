
let baseUrl = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://esai-firstdraft-production.up.railway.app');

if (baseUrl && baseUrl.startsWith('http://') && baseUrl.includes('railway.app')) {
  baseUrl = baseUrl.replace('http://', 'https://');
}

export const API_BASE_URL = baseUrl;

export const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

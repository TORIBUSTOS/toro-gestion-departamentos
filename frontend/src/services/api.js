import axios from 'axios';

// Antes: const API_URL = 'http://localhost:8000';
const API_URL = 'http://localhost:8001'; // <--- Nuevo puerto

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

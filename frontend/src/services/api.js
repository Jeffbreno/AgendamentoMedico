import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5110/api',
});

export default api;

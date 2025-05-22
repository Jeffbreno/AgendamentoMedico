import axios from 'axios';

// Configuração única do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5110/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Erro na resposta:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('Sem resposta do servidor:', error.request);
    } else {
      console.error('Erro ao configurar requisição:', error.message);
    }
    
    // Você pode personalizar a mensagem de erro aqui
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Erro desconhecido na comunicação com o servidor';
    
    return Promise.reject(errorMessage);
  }
);

// Interceptor para adicionar token de autenticação (se necessário)
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

export default api;
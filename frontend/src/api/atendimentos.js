import api from '../services/api';

export const gerarAtendimento = async (dados) => {
  const response = await api.post('/atendimentos', dados);
  return response.data;
};

export const getAtendimentos = async (params) => {
  const response = await api.get('/atendimentos', { params });
  return response.data;
};

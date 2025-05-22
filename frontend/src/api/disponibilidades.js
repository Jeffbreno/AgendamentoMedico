import api from '../services/api';

export const getDisponibilidades = async () => {
  const response = await api.get('/disponibilidades');
  return response.data;
};

export const createDisponibilidade = async (dados) => {
  const response = await api.post('/disponibilidades/definir', dados);
  return response.data;
};

export const deleteDisponibilidade = async (id) => {
  const response = await api.delete(`/disponibilidades/${id}`);
  return response.data;
};

export const getHorariosDisponiveis = async (filtros) => {
  const response = await api.post('/disponibilidades', filtros);
  return response.data;
};

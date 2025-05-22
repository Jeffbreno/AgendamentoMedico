import api from '../services/api';

export const getHorariosDisponiveis = async (filtros) => {
  const response = await api.post('/disponibilidades', filtros);
  return response.data;
};

export const agendarConsulta = async (dados) => {
  const response = await api.post('/agendamentos', dados);
  return response.data;
};

export const getAgendamentos = async (params) => {
  const response = await api.get('/agendamentos', { params });
  return response.data;
};

//IMPLEMENTAR ENDPOINTS A BAIXO
export const getAgendamentoById = async (id) => {
  const response = await api.get(`/agendamentos/${id}`);
  return response.data;
};

export const atualizarStatusAgendamento = async (id, novoStatus) => {
  const response = await api.patch(`/agendamentos/${id}/status`, novoStatus);
  return response.data;
};


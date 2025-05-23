import api from '../services/api';
export const getPacientes = async () => {
  try {
    const response = await api.get('/pacientes');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPaciente = async (pacienteData) => {
  try {
    const response = await api.post('/pacientes', pacienteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePaciente = async (id, pacienteData) => {
  try {
    const response = await api.patch(`/pacientes/${id}`, pacienteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePaciente = async (id) => {
  try {
    await api.delete(`/pacientes/${id}`);
  } catch (error) {
    throw error;
  }
};

export const atualizarStatusAgendamento = async (id, novoStatus) => {
  const response = await api.patch(`/agendamentos/${id}/status`, novoStatus);
  return response.data;
};
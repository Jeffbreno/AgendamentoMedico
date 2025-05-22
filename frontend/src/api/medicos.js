import api from '../services/api';

export const getMedicos = async () => {
  try {
    const response = await api.get('/medicos');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createMedico = async (medicoData) => {
  try {
    const response = await api.post('/medicos', medicoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateMedico = async (id, medicoData) => {
  try {
    const response = await api.patch(`/medicos/${id}`, medicoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMedico = async (id) => {
  try {
    await api.delete(`/medicos/${id}`);
  } catch (error) {
    throw error;
  }
};
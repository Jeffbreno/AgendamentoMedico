import api from '../services/api';

export const getEspecialidades = async () => {
  try {
    const response = await api.get('/especialidades');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEspecialidade = async (especialidadeData) => {
  try {
    const response = await api.post('/especialidades', especialidadeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEspecialidade = async (id, especialidadeData) => {
  try {
    const response = await api.patch(`/especialidades/${id}`, especialidadeData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEspecialidade = async (id) => {
  try {
    await api.delete(`/especialidades/${id}`);
  } catch (error) {
    throw error;
  }
};
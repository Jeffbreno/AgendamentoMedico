import api from '../services/api';

export const getConvenios = async () => {
  try {
    const response = await api.get('/convenios');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createConvenio = async (convenioData) => {
  try {
    const response = await api.post('/convenios', convenioData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateConvenio = async (id, convenioData) => {
  try {
    const response = await api.patch(`/convenios/${id}`, convenioData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteConvenio = async (id) => {
  try {
    await api.delete(`/convenios/${id}`);
  } catch (error) {
    throw error;
  }
};
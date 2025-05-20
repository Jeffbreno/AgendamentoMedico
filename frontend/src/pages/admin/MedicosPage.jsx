import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { FaUserMd, FaPlus, FaSave, FaEdit, FaTrash, FaStethoscope } from 'react-icons/fa';

function MedicosPage() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [form, setForm] = useState({ 
    nome: '', 
    especialidadeIds: [] 
  });
  const [erro, setErro] = useState('');
  const [idEditando, setIdEditando] = useState(null);
  const [modal, setModal] = useState({ show: false, id: null });
  const [loading, setLoading] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resMedicos, resEspecialidades] = await Promise.all([
        api.get('/medicos'),
        api.get('/especialidades')
      ]);
      setMedicos(resMedicos.data);
      setEspecialidades(resEspecialidades.data);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const resetarFormulario = () => {
    setForm({ nome: '', especialidadeIds: [] });
    setIdEditando(null);
    setErro('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (erro) setErro('');
  };

  const toggleEspecialidade = (id) => {
    setForm(prev => ({
      ...prev,
      especialidadeIds: prev.especialidadeIds.includes(id)
        ? prev.especialidadeIds.filter(i => i !== id)
        : [...prev.especialidadeIds, id]
    }));
    if (erro) setErro('');
  };

  const validarFormulario = () => {
    const erros = [];
    
    if (!form.nome.trim()) erros.push('Nome é obrigatório');
    if (form.especialidadeIds.length === 0) erros.push('Selecione pelo menos uma especialidade');
    
    if (erros.length > 0) {
      setErro(erros.join(', '));
      return false;
    }
    return true;
  };

  const salvarMedico = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      if (idEditando) {
        await api.patch(`/medicos/${idEditando}`, form);
      } else {
        await api.post('/medicos', form);
      }
      await carregarDados();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar médico');
    } finally {
      setLoading(false);
    }
  };

  const editarMedico = (medico) => {
    setIdEditando(medico.id);
    setForm({
      nome: medico.nome,
      especialidadeIds: medico.especialidades.map(e => e.id)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  const excluirMedico = async () => {
    setLoading(true);
    try {
      await api.delete(`/medicos/${modal.id}`);
      await carregarDados();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaUserMd className="text-blue-600" />
          Gerenciar Médicos
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {idEditando ? 'Editar Médico' : 'Cadastrar Novo Médico'}
          </h3>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <div className="relative">
                <FaUserMd className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="nome"
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                    erro.includes('Nome') ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome completo do médico"
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {especialidades.map((esp) => (
                  <label
                    key={esp.id}
                    className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                      form.especialidadeIds.includes(esp.id)
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={form.especialidadeIds.includes(esp.id)}
                      onChange={() => toggleEspecialidade(esp.id)}
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      form.especialidadeIds.includes(esp.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {form.especialidadeIds.includes(esp.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-sm">{esp.nome}</span>
                  </label>
                ))}
              </div>
              {erro.includes('especialidade') && (
                <p className="mt-1 text-sm text-red-500">Selecione pelo menos uma especialidade</p>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={salvarMedico}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                  idEditando ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors disabled:opacity-50`}
              >
                {loading ? (
                  <span className="animate-spin">↻</span>
                ) : idEditando ? (
                  <>
                    <FaSave /> Salvar
                  </>
                ) : (
                  <>
                    <FaPlus /> Adicionar
                  </>
                )}
              </button>

              {idEditando && (
                <button
                  onClick={resetarFormulario}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>

            {erro && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {erro}
              </div>
            )}
          </div>
        </div>

        {loading && medicos.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : medicos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum médico cadastrado
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {medicos.map((medico) => (
                <li key={medico.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-2 md:mb-0">
                      <h3 className="font-semibold text-lg">{medico.nome}</h3>
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1 mt-1">
                          <FaStethoscope className="text-gray-400" />
                          <span>
                            {medico.especialidades.map(e => e.nome).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editarMedico(medico)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(medico.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        <FaTrash /> Excluir
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ConfirmModal
          show={modal.show}
          onClose={cancelarExclusao}
          onConfirm={excluirMedico}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este médico?"
          confirmText="Excluir"
          danger={true}
          loading={loading}
        />
      </div>
    </Layout>
  );
}

export default MedicosPage;
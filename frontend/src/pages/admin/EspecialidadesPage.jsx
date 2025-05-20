import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { FaPlus, FaSave, FaEdit, FaTrash, FaStethoscope, FaTimes } from 'react-icons/fa';

function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [nome, setNome] = useState('');
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState({ show: false, id: null });
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  const carregarEspecialidades = async () => {
    setLoading(true);
    try {
      const res = await api.get('/especialidades');
      setEspecialidades(res.data);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  };

  const resetarFormulario = () => {
    setNome('');
    setIdEditando(null);
    setErro('');
  };

  const validarFormulario = () => {
    if (!nome.trim()) {
      setErro('O nome da especialidade é obrigatório');
      return false;
    }
    return true;
  };

  const salvarEspecialidade = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      if (idEditando) {
        await api.patch(`/especialidades/${idEditando}`, { nome });
      } else {
        await api.post('/especialidades', { nome });
      }
      await carregarEspecialidades();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar especialidade');
    } finally {
      setLoading(false);
    }
  };

  const editarEspecialidade = (esp) => {
    setIdEditando(esp.id);
    setNome(esp.nome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  const excluirEspecialidade = async () => {
    setLoading(true);
    try {
      await api.delete(`/especialidades/${modal.id}`);
      await carregarEspecialidades();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir especialidade');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEspecialidades();
  }, []);

  const especialidadesFiltradas = especialidades.filter(esp =>
    esp.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaStethoscope className="text-blue-600" />
          Gerenciar Especialidades
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {idEditando ? 'Editar Especialidade' : 'Cadastrar Nova Especialidade'}
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  erro ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da especialidade"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (erro) setErro('');
                }}
              />
              <FaStethoscope className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={salvarEspecialidade}
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
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {erro && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {erro}
            </div>
          )}
        </div>

        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Buscar especialidades..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {loading && especialidades.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : especialidadesFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {busca ? 'Nenhuma especialidade encontrada' : 'Nenhuma especialidade cadastrada'}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {especialidadesFiltradas.map((esp) => (
                <li key={esp.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <FaStethoscope className="text-lg" />
                      </div>
                      <span className="font-medium">{esp.nome}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editarEspecialidade(esp)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(esp.id)}
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
          onConfirm={excluirEspecialidade}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir esta especialidade?"
          confirmText="Excluir"
          danger={true}
          loading={loading}
        />
      </div>
    </Layout>
  );
}

export default EspecialidadesPage;
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { FaHospital, FaPlus, FaSave, FaEdit, FaTrash, FaTimes, FaSearch } from 'react-icons/fa';

function ConveniosPage() {
  const [convenios, setConvenios] = useState([]);
  const [nome, setNome] = useState('');
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState({ show: false, id: null });
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  const carregarConvenios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/convenios');
      setConvenios(res.data);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar convênios');
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
      setErro('O nome do convênio é obrigatório');
      return false;
    }
    return true;
  };

  const salvarConvenio = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      if (idEditando) {
        await api.patch(`/convenios/${idEditando}`, { nome });
      } else {
        await api.post('/convenios', { nome });
      }
      await carregarConvenios();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar convênio');
    } finally {
      setLoading(false);
    }
  };

  const editarConvenio = (convenio) => {
    setNome(convenio.nome);
    setIdEditando(convenio.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  const excluirConvenio = async () => {
    setLoading(true);
    try {
      await api.delete(`/convenios/${modal.id}`);
      await carregarConvenios();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir convênio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConvenios();
  }, []);

  const conveniosFiltrados = convenios.filter(conv =>
    conv.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaHospital className="text-blue-600" />
          Gerenciar Convênios
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {idEditando ? 'Editar Convênio' : 'Cadastrar Novo Convênio'}
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  erro ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do convênio"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (erro) setErro('');
                }}
              />
              <FaHospital className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={salvarConvenio}
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
            placeholder="Buscar convênios..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        {loading && convenios.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : conveniosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {busca ? 'Nenhum convênio encontrado' : 'Nenhum convênio cadastrado'}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {conveniosFiltrados.map((conv) => (
                <li key={conv.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <FaHospital className="text-lg" />
                      </div>
                      <span className="font-medium">{conv.nome}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editarConvenio(conv)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(conv.id)}
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
          onConfirm={excluirConvenio}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este convênio?"
          confirmText="Excluir"
          danger={true}
          loading={loading}
        />
      </div>
    </Layout>
  );
}

export default ConveniosPage;
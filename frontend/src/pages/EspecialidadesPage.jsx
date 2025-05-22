import { useEffect, useState } from 'react';
import {
  getEspecialidades,
  createEspecialidade,
  updateEspecialidade,
  deleteEspecialidade
} from '../api/especialidades';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import Table from '../components/Table';
import { FaPlus, FaSave, FaEdit, FaTrash, FaStethoscope, FaTimes, FaSearch } from 'react-icons/fa';

function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [nome, setNome] = useState('');
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState({ show: false, id: null });
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const carregarEspecialidades = async () => {
    setLoading(true);
    try {
      const data = await getEspecialidades();
      setEspecialidades(data);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar especialidades');
      console.error(error);
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
        await updateEspecialidade(idEditando, { nome });
      } else {
        await createEspecialidade({ nome });
      }
      await carregarEspecialidades();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar especialidade');
      console.error(error);
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
      await deleteEspecialidade(modal.id);
      await carregarEspecialidades();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir especialidade');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEspecialidades();
  }, []);

  // Filtragem e paginação
  const especialidadesFiltradas = especialidades.filter(esp =>
    esp.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = especialidadesFiltradas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(especialidadesFiltradas.length / itemsPerPage);

  // Definição das colunas da tabela
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (id) => <span className="font-mono text-gray-600">{id}</span>
    },
    {
      header: 'Nome',
      accessor: 'nome',
      render: (nome) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <FaStethoscope className="text-lg" />
          </div>
          <span className="font-medium">{nome}</span>
        </div>
      )
    },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => editarEspecialidade(row)}
           className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
            title="Editar"
          >
            <FaEdit size={14} /> Editar
          </button>
          <button
            onClick={() => confirmarExclusao(id)}
             className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
            title="Excluir">
            <FaTrash size={14} /> Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaStethoscope className="text-blue-600" />
          Gerenciar Especialidades
        </h1>
      </div>

      {/* Formulário de cadastro/edição */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {idEditando ? 'Editar Especialidade' : 'Cadastrar Nova Especialidade'}
        </h3>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${erro ? 'border-red-500' : 'border-gray-300'
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${idEditando ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors disabled:opacity-70`}
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

      {/* Busca */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Buscar especialidades..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setCurrentPage(1);
          }}
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Lista de especialidades */}
      {loading && especialidades.length === 0 ? (
        <Loading />
      ) : especialidadesFiltradas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {busca ? 'Nenhuma especialidade encontrada' : 'Nenhuma especialidade cadastrada'}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <Table
              data={currentItems}
              columns={columns}
              emptyMessage="Nenhuma especialidade encontrada"
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Modal de confirmação */}
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

  );
}

export default EspecialidadesPage;
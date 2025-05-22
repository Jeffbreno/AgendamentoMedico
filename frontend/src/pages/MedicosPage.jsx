import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMedicos,
  createMedico,
  updateMedico,
  deleteMedico
} from '../api/medicos';
import { getEspecialidades } from '../api/especialidades';
import ConfirmModal from '../components/ConfirmModal';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { FaUserMd, FaPlus, FaSave, FaEdit, FaTrash, FaTimes, FaSearch } from 'react-icons/fa';
import Loading from '../components/Loading';

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
  const [busca, setBusca] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [medicosData, especialidadesData] = await Promise.all([
        getMedicos(),
        getEspecialidades()
      ]);
      setMedicos(medicosData);
      setEspecialidades(especialidadesData);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar dados');
      console.error(error);
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
        await updateMedico(idEditando, form);
      } else {
        await createMedico(form);
      }
      await carregarDados();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar médico');
      console.error(error);
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
      await deleteMedico(modal.id);
      await carregarDados();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir médico');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtragem e paginação
  const medicosFiltrados = medicos.filter(medico =>
    medico.nome.toLowerCase().includes(busca.toLowerCase()) ||
    medico.especialidades.some(esp =>
      esp.nome.toLowerCase().includes(busca.toLowerCase())
    )
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = medicosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(medicosFiltrados.length / itemsPerPage);

  const columns = [
    {
      header: 'Nome',
      accessor: 'nome',
      render: (nome, row) => (
        <div className="font-medium text-gray-900">{nome}</div>
      )
    },
    {
      header: 'Especialidades',
      accessor: 'especialidades',
      render: (especialidades) => (
        <div className="flex flex-wrap gap-1">
          {especialidades.map(esp => (
            <span
              key={esp.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {esp.nome}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => editarMedico(row)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
            title="Editar"
          >
            <FaEdit /> Editar
          </button>
          <button
            onClick={() => confirmarExclusao(id)}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
            title="Excluir"
          >
            <FaTrash /> Excluir
          </button>
        </div>
      ),
    },
  ];

  if (loading && medicos.length === 0) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaUserMd className="text-blue-600" />
          Gerenciar Médicos
        </h1>
      </div>

      {erro && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {erro}
        </div>
      )}

      {/* Formulário */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {idEditando ? 'Editar Médico' : 'Cadastrar Novo Médico'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              name="nome"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${erro.includes('Nome') ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Nome completo do médico"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Especialidades</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {especialidades.map((esp) => (
                <label
                  key={esp.id}
                  className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${form.especialidadeIds.includes(esp.id)
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
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.especialidadeIds.includes(esp.id)
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
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={salvarMedico}
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
                <FaTimes /> Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Buscar médicos ou especialidades..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setCurrentPage(1);
          }}
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Lista de médicos */}
      {medicosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {busca ? 'Nenhum médico encontrado' : 'Nenhum médico cadastrado'}
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden mb-4">
            <Table
              data={currentItems}
              columns={columns}
              emptyMessage="Nenhum médico encontrado"
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

      <ConfirmModal
        show={modal.show}
        onClose={cancelarExclusao}
        onConfirm={excluirMedico}
        message="Tem certeza que deseja excluir este médico?"
        title="Confirmar Exclusão"
        danger
        loading={loading}
      />
    </div>
  );
}

export default MedicosPage;
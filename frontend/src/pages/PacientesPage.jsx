import { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import { 
  getPacientes,
  createPaciente,
  updatePaciente,
  deletePaciente
} from '../api/pacientes';
import { getConvenios } from '../api/convenios';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import Table from '../components/Table';
import { FaEdit, FaTrash, FaSave, FaPlus, FaUser, FaPhone, FaEnvelope, FaHospital, FaSearch } from 'react-icons/fa';

function PacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    convenioId: '',
  });
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState({ show: false, id: null });
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [pacientesData, conveniosData] = await Promise.all([
        getPacientes(),
        getConvenios()
      ]);
      setPacientes(pacientesData);
      setConvenios(conveniosData);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar dados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetarFormulario = () => {
    setForm({
      nome: '',
      email: '',
      telefone: '',
      convenioId: '',
    });
    setIdEditando(null);
    setErro('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (erro) setErro('');
  };

  const validarFormulario = () => {
    const { nome, email, telefone, convenioId } = form;
    const erros = [];

    if (!nome.trim()) erros.push('Nome é obrigatório');
    if (!email.trim()) erros.push('Email é obrigatório');
    if (!telefone.trim()) erros.push('Telefone é obrigatório');
    if (!convenioId) erros.push('Convênio é obrigatório');

    if (!/^\S+@\S+\.\S+$/.test(email)) erros.push('Email inválido');
    if (telefone.replace(/\D/g, '').length < 11) erros.push('Telefone incompleto');

    if (erros.length > 0) {
      setErro(erros.join(', '));
      return false;
    }
    return true;
  };

  const salvarPaciente = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      if (idEditando) {
        await updatePaciente(idEditando, form);
      } else {
        await createPaciente(form);
      }
      await carregarDados();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar paciente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const editarPaciente = (paciente) => {
    setIdEditando(paciente.id);
    setForm({
      nome: paciente.nome,
      email: paciente.email,
      telefone: paciente.telefone,
      convenioId: String(paciente.convenioId),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  const excluirPaciente = async () => {
    setLoading(true);
    try {
      await deletePaciente(modal.id);
      await carregarDados();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir paciente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtragem e paginação
  const pacientesFiltrados = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(busca.toLowerCase()) ||
    paciente.email.toLowerCase().includes(busca.toLowerCase()) ||
    paciente.telefone.includes(busca) ||
    paciente.convenioNome.toLowerCase().includes(busca.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pacientesFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pacientesFiltrados.length / itemsPerPage);

  // Definição das colunas da tabela
  const columns = [
    { 
      header: 'Nome', 
      accessor: 'nome',
      render: (nome) => (
        <div className="font-medium text-gray-900">{nome}</div>
      )
    },
    { 
      header: 'Email', 
      accessor: 'email',
      render: (email) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FaEnvelope className="text-gray-400" />
          {email}
        </div>
      )
    },
    { 
      header: 'Telefone', 
      accessor: 'telefone',
      render: (telefone) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FaPhone className="text-gray-400" />
          {telefone}
        </div>
      )
    },
    { 
      header: 'Convênio', 
      accessor: 'convenioNome',
      render: (convenioNome) => (
        <div className="flex items-center gap-2">
          <FaHospital className="text-blue-400" />
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            {convenioNome}
          </span>
        </div>
      )
    },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => editarPaciente(row)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            <FaEdit size={14} /> Editar
          </button>
          <button
            onClick={() => confirmarExclusao(id)}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
          >
            <FaTrash size={14} /> Excluir
          </button>
        </div>
      ),
    },
  ];

  if (loading && pacientes.length === 0) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUser className="text-blue-600" />
        Gerenciar Pacientes
      </h2>

      {/* Formulário de cadastro/edição */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">
          {idEditando ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                name="nome"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  erro.includes('Nome') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome completo"
                value={form.nome}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                name="email"
                type="email"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  erro.includes('Email') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <IMaskInput
                mask="(00) 00000-0000"
                name="telefone"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  erro.includes('Telefone') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onAccept={(value) => setForm(prev => ({ ...prev, telefone: value }))}
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Convênio</label>
            <div className="relative">
              <FaHospital className="absolute left-3 top-3 text-gray-400" />
              <select
                name="convenioId"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
                  erro.includes('Convênio') ? 'border-red-500' : 'border-gray-300'
                }`}
                value={form.convenioId}
                onChange={handleChange}
              >
                <option value="">Selecione o convênio</option>
                {convenios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={salvarPaciente}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              idEditando ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
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

      {/* Busca */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Buscar pacientes..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setCurrentPage(1);
          }}
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
      </div>

      {/* Lista de pacientes usando o componente Table */}
      {pacientesFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <Table 
              data={currentItems} 
              columns={columns} 
              emptyMessage="Nenhum paciente encontrado"
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
        onConfirm={excluirPaciente}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este paciente?"
        confirmText="Excluir"
        danger={true}
        loading={loading}
      />
    </div>
  );
}

export default PacientesPage;
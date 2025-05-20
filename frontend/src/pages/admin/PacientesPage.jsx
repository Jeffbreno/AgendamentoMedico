import { useEffect, useState } from 'react';
import { IMaskInput } from 'react-imask';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { FaEdit, FaTrash, FaSave, FaPlus, FaUser, FaPhone, FaEnvelope, FaHospital } from 'react-icons/fa';

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

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resPacientes, resConvenios] = await Promise.all([
        api.get('/pacientes'),
        api.get('/convenios'),
      ]);
      setPacientes(resPacientes.data);
      setConvenios(resConvenios.data);
      resetarFormulario();
    } catch (error) {
      setErro('Erro ao carregar dados');
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
        await api.patch(`/pacientes/${idEditando}`, form);
      } else {
        await api.post('/pacientes', form);
      }
      await carregarDados();
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar paciente');
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
      await api.delete(`/pacientes/${modal.id}`);
      await carregarDados();
      cancelarExclusao();
    } catch (error) {
      setErro('Erro ao excluir paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaUser className="text-blue-600" />
          Gerenciar Pacientes
        </h2>

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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${idEditando ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} transition-colors disabled:opacity-50`}
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

        {loading && pacientes.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : pacientes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum paciente cadastrado
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {pacientes.map((paciente) => (
                <li key={paciente.id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-2 md:mb-0">
                      <h3 className="font-semibold text-lg">{paciente.nome}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Email: {paciente.email}</p>
                        <p>Telefone: {paciente.telefone}</p>
                        <p>Convênio: {paciente.convenioNome}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editarPaciente(paciente)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => confirmarExclusao(paciente.id)}
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
          onConfirm={excluirPaciente}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este paciente?"
          loading={loading}
        />
      </div>
    </Layout>
  );
}

export default PacientesPage;
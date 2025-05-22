import { useEffect, useState } from 'react';
import { getDisponibilidades, createDisponibilidade, deleteDisponibilidade } from '../api/disponibilidades';
import { getEspecialidades } from '../api/especialidades';
import { getMedicos } from '../api/medicos';
import ConfirmModal from '../components/ConfirmModal';
import Loading from '../components/Loading';
import Table from '../components/Table';
import { FaCalendarPlus, FaClock, FaTrash } from 'react-icons/fa';

function DisponibilidadePage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [form, setForm] = useState({
    medico: '',           
    especialidadeId: '',
    diaSemana: '',
    horaInicio: '',
    horaFim: '',
    duracaoConsultaMinutos: ''
  });

  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ show: false, id: null });

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];

  // Carrega especialidades, médicos e disponibilidades
  const carregarDados = async () => {
    setLoading(true);
    try {
      const [esp, med, disp] = await Promise.all([
        getEspecialidades(),
        getMedicos(),
        getDisponibilidades()
      ]);
      setEspecialidades(esp);
      setMedicos(med);
      setDisponibilidades(disp);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Atualiza estado do form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };

  // Validação básica do form
  const validar = () => {
    const campos = ['medico', 'especialidadeId', 'diaSemana', 'horaInicio', 'horaFim', 'duracaoConsultaMinutos'];
    for (let campo of campos) {
      if (!form[campo]) {
        setErro(`O campo "${campo}" é obrigatório`);
        return false;
      }
    }
    return true;
  };

  // Salva nova disponibilidade via API
  const salvar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await createDisponibilidade(form);
      await carregarDados();
      setForm({
        medico: '',
        especialidadeId: '',
        diaSemana: '',
        horaInicio: '',
        horaFim: '',
        duracaoConsultaMinutos: ''
      });
    } catch (err) {
      console.error(err);
      setErro('Erro ao salvar disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  // Modal exclusão
  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  // Excluir disponibilidade
  const excluir = async () => {
    setLoading(true);
    try {
      await deleteDisponibilidade(modal.id);
      await carregarDados();
      cancelarExclusao();
    } catch (err) {
      console.error(err);
      setErro('Erro ao excluir disponibilidade');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Para mostrar nome ao invés de id na tabela
  const pegarNomeMedico = (id) => {
    const m = medicos.find(med => med.id === id);
    return m ? m.nome : id;
  };

  const pegarNomeEspecialidade = (id) => {
    const e = especialidades.find(esp => esp.id === id);
    return e ? e.nome : id;
  };

  // Colunas da tabela
  const columns = [
    {
      header: 'Médico',
      accessor: 'medico',
      render: (medicoId) => pegarNomeMedico(medicoId)
    },
    {
      header: 'Especialidade',
      accessor: 'especialidadeId',
      render: (id) => pegarNomeEspecialidade(id)
    },
    { header: 'Dia', accessor: 'diaSemana' },
    { header: 'Início', accessor: 'horaInicio' },
    { header: 'Fim', accessor: 'horaFim' },
    {
      header: 'Duração',
      accessor: 'duracaoConsultaMinutos',
      render: (v) => `${v} min`
    },
    {
      header: 'Ações',
      accessor: 'id',
      render: (id) => (
        <button
          onClick={() => confirmarExclusao(id)}
          className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-1"
          title="Excluir disponibilidade"
        >
          <FaTrash />
          Excluir
        </button>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaCalendarPlus className="text-blue-600" />
        Definir Disponibilidade
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Médico seleciona pelo id */}
          <select
            name="medico"
            value={form.medico}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Selecione o médico</option>
            {medicos.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>

          {/* Especialidade */}
          <select
            name="especialidadeId"
            value={form.especialidadeId}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Selecione a especialidade</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>

          {/* Dia da semana */}
          <select
            name="diaSemana"
            value={form.diaSemana}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">Dia da semana</option>
            {diasSemana.map((dia) => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>

          {/* Horários e duração */}
          <input
            name="horaInicio"
            type="time"
            value={form.horaInicio}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Hora Início"
          />
          <input
            name="horaFim"
            type="time"
            value={form.horaFim}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Hora Fim"
          />
          <input
            name="duracaoConsultaMinutos"
            type="number"
            min="1"
            value={form.duracaoConsultaMinutos}
            onChange={handleChange}
            className="border p-2 rounded"
            placeholder="Duração (min)"
          />
        </div>

        {erro && <div className="text-red-600 mt-2">{erro}</div>}

        <button
          onClick={salvar}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <FaClock /> Salvar Disponibilidade
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <Table
            data={disponibilidades}
            columns={columns}
            emptyMessage="Nenhuma disponibilidade cadastrada"
          />
        </div>
      )}

      <ConfirmModal
        show={modal.show}
        onClose={cancelarExclusao}
        onConfirm={excluir}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta disponibilidade?"
        confirmText="Excluir"
        danger={true}
        loading={loading}
      />
    </div>
  );
}

export default DisponibilidadePage;

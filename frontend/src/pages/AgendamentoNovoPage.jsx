import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

function AgendamentoNovoPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    pacienteId: '',
    convenioId: '',
  });
  const [erro, setErro] = useState('');

  const horarioSelecionado = state?.horario;

  useEffect(() => {
    api.get('/pacientes').then((res) => setPacientes(res.data));
  }, []);

  const pacienteSelecionado = pacientes.find(p => p.id === parseInt(form.pacienteId));
  const conveniosPaciente = pacienteSelecionado?.convenios || [pacienteSelecionado?.convenio];

  const atualizar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (erro) setErro('');
  };

  const confirmar = async () => {
    if (!form.pacienteId || !form.convenioId) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await api.post('/agendamentos', {
        pacienteId: parseInt(form.pacienteId),
        convenioId: parseInt(form.convenioId),
        especialidadeId: horarioSelecionado.especialidadeId,
        dataHora: `${horarioSelecionado.data}T${horarioSelecionado.horaInicio}:00`,
      });

      setSucesso(true)
      setTimeout(() => navigate('/agendamentos'), 2000);
    } catch {
      setErro('Erro ao agendar.');
    }
  };

  if (!horarioSelecionado) {
    return (
      <Layout>
        <p>Horário não selecionado. Volte à página anterior.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Confirmar Agendamento</h2>

      <p className="mb-4">
        <strong>Especialidade:</strong> {horarioSelecionado.especialidadeNome}<br />
        <strong>Data:</strong> {horarioSelecionado.data} — {horarioSelecionado.horaInicio} às {horarioSelecionado.horaFim}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          name="pacienteId"
          value={form.pacienteId}
          onChange={atualizar}
          className="border px-4 py-2 rounded"
        >
          <option value="">Selecione o paciente</option>
          {pacientes.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </select>

        <select
          name="convenioId"
          value={form.convenioId}
          onChange={atualizar}
          className="border px-4 py-2 rounded"
        >
          <option value="">Selecione o convênio</option>
          {pacientes
            .find(p => p.id === parseInt(form.pacienteId))
            ?.convenioId && (
              <option value={pacienteSelecionado.convenioId}>
                {pacienteSelecionado.convenioNome}
              </option>
            )}
        </select>
      </div>

      {erro && <div className="text-red-500 mb-4 text-sm">{erro}</div>}

      {sucesso && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Agendamento realizado com sucesso! Redirecionando...
        </div>
      )}<button
        onClick={confirmar}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Confirmar Agendamento
      </button>
    </Layout>
  );
}

export default AgendamentoNovoPage;

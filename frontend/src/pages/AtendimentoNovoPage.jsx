import { useEffect, useState } from 'react';
import { FaCheck, FaClipboardList } from 'react-icons/fa';
import api from '../services/api';
import Layout from '../components/Layout';

function AtendimentoNovoPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [form, setForm] = useState({
    agendamentoId: '',
    observacoes: '',
  });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      const res = await api.get('/agendamentos');
      // Exibir apenas os com status válidos para atendimento
      const pendentes = res.data.filter(a =>
        ['Agendado', 'Confirmado'].includes(a.status)
      );
      setAgendamentos(pendentes);
    } catch {
      setErro('Erro ao carregar agendamentos.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (erro) setErro('');
  };

  const salvar = async () => {
    if (!form.agendamentoId) {
      setErro('Selecione um agendamento.');
      return;
    }

    setLoading(true);
    setErro('');
    setMensagem('');

    try {
      await api.post('/atendimentos', {
        agendamentoId: parseInt(form.agendamentoId),
        observacoes: form.observacoes,
      });

      setMensagem('Atendimento registrado com sucesso!');
      setForm({ agendamentoId: '', observacoes: '' });
      await carregarAgendamentos(); // atualiza a lista removendo o atendido
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao salvar atendimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaCheck className="text-green-600" />
          Registrar Atendimento
        </h2>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Agendamento</label>
            <select
              name="agendamentoId"
              value={form.agendamentoId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecione um agendamento</option>
              {agendamentos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.paciente} — {new Date(a.dataHora).toLocaleString('pt-BR')} — {a.especialidadeNome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observações (opcional)</label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 min-h-[80px]"
              placeholder="Anotações sobre o atendimento..."
            />
          </div>

          <div className="flex gap-3 items-center pt-2">
            <button
              onClick={salvar}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaClipboardList />
              {loading ? 'Salvando...' : 'Registrar Atendimento'}
            </button>
          </div>

          {erro && <div className="text-red-500 text-sm mt-2">{erro}</div>}
          {mensagem && <div className="text-green-600 text-sm mt-2">{mensagem}</div>}
        </div>
      </div>
    </Layout>
  );
}

export default AtendimentoNovoPage;

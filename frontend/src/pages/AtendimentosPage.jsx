import { useEffect, useState } from 'react';
import { getAgendamentos } from '../api/agendamentos';
import { gerarAtendimento } from '../api/atendimentos';
import Loading from '../components/Loading';
import Table from '../components/Table';

import { FaClipboardCheck, FaStethoscope } from 'react-icons/fa';

function AtendimentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [mensagem, setMensagem] = useState('');

  const buscarAgendamentos = async () => {
    setLoading(true);
    setErro('');
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const data = await getAgendamentos({ dataInicio: hoje });
      setAgendamentos(data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const registrarAtendimento = async () => {
    if (!selecionado) {
      setErro('Selecione um agendamento');
      return;
    }
    setLoading(true);
    try {
      await gerarAtendimento({
        agendamentoId: selecionado.id,
        observacoes
      });
      setMensagem('Atendimento registrado com sucesso!');
      setSelecionado(null);
      setObservacoes('');
      await buscarAgendamentos(); // Atualiza a lista
    } catch (err) {
      console.error(err);
      setErro('Erro ao registrar atendimento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarAgendamentos();
  }, []);

  const columns = [
    { header: 'Paciente', accessor: 'paciente' },
    { header: 'Especialidade', accessor: 'especialidadeNome' },
    { header: 'Médico', accessor: 'medico' },
    {
      header: 'Data/Hora',
      accessor: 'dataHora',
      render: (v) => new Date(v).toLocaleString('pt-BR')
    },
    {
      header: 'Selecionar',
      accessor: 'id',
      render: (_, row) => (
        <button
          onClick={() => {
            setSelecionado(row);
            setObservacoes('');
            setMensagem('');
          }}
          className="text-blue-600 underline text-sm"
        >
          Registrar Atendimento
        </button>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaStethoscope className="text-blue-600" />
        Registrar Atendimento
      </h2>

      {erro && <div className="text-red-600 mb-4">{erro}</div>}
      {mensagem && <div className="text-green-700 mb-4">{mensagem}</div>}

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <Table
            data={agendamentos}
            columns={columns}
            emptyMessage="Nenhum agendamento encontrado para atendimento"
          />
        </div>
      )}

      {selecionado && (
        <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaClipboardCheck className="text-blue-600" />
            Atendimento para {selecionado.paciente} em{' '}
            {new Date(selecionado.dataHora).toLocaleString('pt-BR')}
          </h3>

          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Observações (opcional)"
            className="w-full border rounded p-2 mb-4"
            rows={4}
          />

          <button
            onClick={registrarAtendimento}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Confirmar Atendimento
          </button>
        </div>
      )}
    </div>
  );
}

export default AtendimentosPage;
import { useEffect, useState } from 'react';
import { getAgendamentos } from '../api/agendamentos';
import { getPacientes } from '../api/pacientes';
import Loading from '../components/Loading';
import Table from '../components/Table';

import { FaListAlt, FaSearch } from 'react-icons/fa';

function AgendamentosPage() {
  const [pacientes, setPacientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const [filtros, setFiltros] = useState({
    paciente: '',
    dataInicio: '',
    dataFim: ''
  });

  const carregarPacientes = async () => {
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar pacientes');
    }
  };

  const buscarAgendamentos = async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await getAgendamentos(filtros);
      setAgendamentos(data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao buscar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPacientes();
  }, []);

  const columns = [
    { header: 'Paciente', accessor: 'paciente' },
    { header: 'Especialidade', accessor: 'especialidadeNome' },
    { header: 'Convênio', accessor: 'convenioNome' },
    { header: 'Médico', accessor: 'medico' },
    {
      header: 'Data/Hora',
      accessor: 'dataHora',
      render: (v) => new Date(v).toLocaleString('pt-BR')
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaListAlt className="text-blue-600" />
        Consultas Agendadas
      </h2>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={filtros.paciente}
          onChange={(e) => setFiltros({ ...filtros, paciente: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Filtrar por paciente</option>
          {pacientes.map((p) => (
            <option key={p.id} value={p.nome}>{p.nome}</option>
          ))}
        </select>

        <input
          type="date"
          value={filtros.dataInicio}
          onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
          className="border p-2 rounded"
          placeholder="Data início"
        />

        <input
          type="date"
          value={filtros.dataFim}
          onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
          className="border p-2 rounded"
          placeholder="Data fim"
        />

        <div className="md:col-span-3">
          <button
            onClick={buscarAgendamentos}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <FaSearch /> Buscar Agendamentos
          </button>
        </div>
      </div>

      {/* Resultado */}
      {erro && <div className="text-red-600 mb-4">{erro}</div>}

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <Table data={agendamentos} columns={columns} emptyMessage="Nenhum agendamento encontrado" />
        </div>
      )}
    </div>
  );
}

export default AgendamentosPage;
// 
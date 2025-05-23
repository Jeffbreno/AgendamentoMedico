import { useEffect, useState } from 'react';
import { getEspecialidades } from '../api/especialidades';
import { getMedicos } from '../api/medicos';
import { getPacientes } from '../api/pacientes';
import { getConvenios } from '../api/convenios';
import { getHorariosDisponiveis } from '../api/disponibilidades';
import { agendarConsulta } from '../api/agendamentos';
import Loading from '../components/Loading';
import { FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa';

function AgendamentoPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [horarios, setHorarios] = useState([]);
  
  const [form, setForm] = useState({
    especialidadeId: '',
    data: '',
    medicoId: '' // agora usamos o ID do médico
  });

  const [agendamento, setAgendamento] = useState({
    pacienteId: '',
    convenioId: '',
    dataHora: ''
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [esp, med, pac, conv] = await Promise.all([
        getEspecialidades(),
        getMedicos(),
        getPacientes(),
        getConvenios()
      ]);
      setEspecialidades(esp);
      setMedicos(med);
      setPacientes(pac);
      setConvenios(conv);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const buscarHorarios = async () => {
    if (!form.especialidadeId || !form.data) {
      setErro('Informe a especialidade e a data');
      return;
    }

    setLoading(true);
    try {
      const filtros = {
        especialidadeId: parseInt(form.especialidadeId),
        data: form.data,
        medicoId: form.medicoId ? parseInt(form.medicoId) : undefined
      };
      const data = await getHorariosDisponiveis(filtros);
      setHorarios(data);
      setErro('');
    } catch (err) {
      console.error(err);
      setErro('Erro ao buscar horários');
    } finally {
      setLoading(false);
    }
  };

  const selecionarHorario = (hora) => {
    if (!hora.disponivel) return;
    const dataHoraCompleta = `${form.data}T${hora.horaInicio}:00Z`;
    setAgendamento({ ...agendamento, dataHora: dataHoraCompleta });
    setConfirmado(false);
  };

  const confirmarAgendamento = async () => {
    const { pacienteId, convenioId, dataHora } = agendamento;
    if (!pacienteId || !convenioId || !dataHora) {
      setErro('Preencha todos os campos e selecione um horário');
      return;
    }

    setLoading(true);
    try {
      await agendarConsulta({
        ...agendamento,
        pacienteId: parseInt(pacienteId),
        especialidadeId: parseInt(form.especialidadeId),
        convenioId: parseInt(convenioId)
      });
      setConfirmado(true);
      setErro('');
    } catch (err) {
      console.error(err);
      setErro('Erro ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaCalendarAlt className="text-blue-600" />
        Agendar Consulta
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <select value={form.especialidadeId} onChange={(e) => setForm({ ...form, especialidadeId: e.target.value })} className="border p-2 rounded">
          <option value="">Selecione a especialidade</option>
          {especialidades.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>

        <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="border p-2 rounded" />

        <select value={form.medicoId} onChange={(e) => setForm({ ...form, medicoId: e.target.value })} className="border p-2 rounded">
          <option value="">(Opcional) Filtrar por médico</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>

        <button onClick={buscarHorarios} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
          <FaClock /> Ver Horários
        </button>
      </div>

      {erro && <div className="text-red-600 mb-4">{erro}</div>}

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {horarios.map((h, idx) => (
            <button
              key={idx}
              disabled={!h.disponivel}
              onClick={() => selecionarHorario(h)}
              className={`p-3 rounded text-sm font-semibold transition-all
                ${h.disponivel ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              {h.horaInicio} - {h.horaFim}
            </button>
          ))}
        </div>
      )}

      {agendamento.dataHora && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaUserMd className="text-blue-600" /> Confirmar Agendamento
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={agendamento.paciente} onChange={(e) => setAgendamento({ ...agendamento, pacienteId: e.target.value })} className="border p-2 rounded">
              <option value="">Selecione o paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>

            <select value={agendamento.convenioId} onChange={(e) => setAgendamento({ ...agendamento, convenioId: e.target.value })} className="border p-2 rounded">
              <option value="">Selecione o convênio</option>
              {convenios.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <button onClick={confirmarAgendamento} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Confirmar Consulta
          </button>

          {confirmado && (
            <div className="mt-4 text-green-700 font-medium">
              ✅ Consulta agendada com sucesso!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AgendamentoPage;

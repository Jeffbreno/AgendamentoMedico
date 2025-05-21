import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import { FaClock, FaCalendarDay, FaUserMd, FaStethoscope, FaSave, FaSpinner, FaTrash, FaEdit } from 'react-icons/fa';
import { MdAccessTime, MdEventAvailable } from 'react-icons/md';

function DisponibilidadesPage() {
  const [medicos, setMedicos] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [form, setForm] = useState({
    medicoId: '',
    especialidadeId: '',
    diaSemana: '',
    horaInicio: '',
    horaFim: '',
    duracaoConsultaMinutos: 30,
  });
  const [mensagem, setMensagem] = useState({ texto: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [carregandoMedicos, setCarregandoMedicos] = useState(true);

  const diasSemana = [
    { id: 0, nome: 'Domingo' },
    { id: 1, nome: 'Segunda-feira' },
    { id: 2, nome: 'Terça-feira' },
    { id: 3, nome: 'Quarta-feira' },
    { id: 4, nome: 'Quinta-feira' },
    { id: 5, nome: 'Sexta-feira' },
    { id: 6, nome: 'Sábado' }
  ];

  const carregarMedicos = async () => {
    try {
      const res = await api.get('/medicos');
      setMedicos(res.data);
    } catch (error) {
      setMensagem({ texto: 'Erro ao carregar médicos', tipo: 'erro' });
    } finally {
      setCarregandoMedicos(false);
    }
  };

  const carregarDisponibilidades = async () => {
    const res = await api.get('/disponibilidades');
    setDisponibilidades(res.data);
  };

  useEffect(() => {
    carregarMedicos();
    carregarDisponibilidades();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (mensagem.texto) setMensagem({ texto: '', tipo: '' });
  };

  const medicoSelecionado = medicos.find(m => m.id === parseInt(form.medicoId));
  const especialidadesFiltradas = medicoSelecionado?.especialidades || [];

  const validarFormulario = () => {
    const erros = [];

    if (!form.medicoId) erros.push('Selecione um médico');
    if (!form.especialidadeId) erros.push('Selecione uma especialidade');
    if (form.diaSemana === '') erros.push('Selecione um dia da semana');
    if (!form.horaInicio) erros.push('Informe a hora de início');
    if (!form.horaFim) erros.push('Informe a hora de término');
    if (form.horaInicio >= form.horaFim) erros.push('Hora de início deve ser anterior à hora de término');
    if (!form.duracaoConsultaMinutos || form.duracaoConsultaMinutos < 5 || form.duracaoConsultaMinutos > 180) {
      erros.push('Duração da consulta deve ser entre 5 e 180 minutos');
    }

    if (erros.length > 0) {
      setMensagem({ texto: erros.join(', '), tipo: 'erro' });
      return false;
    }
    return true;
  };

  const salvarDisponibilidade = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      await api.post('/disponibilidades/definir', {
        ...form,
        diaSemana: parseInt(form.diaSemana),
        medicoId: parseInt(form.medicoId),
        especialidadeId: parseInt(form.especialidadeId),
        duracaoConsultaMinutos: parseInt(form.duracaoConsultaMinutos),
      });

      setMensagem({
        texto: 'Disponibilidade cadastrada com sucesso!',
        tipo: 'sucesso'
      });

      await carregarDisponibilidades();

      setForm({
        medicoId: '',
        especialidadeId: '',
        diaSemana: '',
        horaInicio: '',
        horaFim: '',
        duracaoConsultaMinutos: 30,
      });
    } catch (error) {
      setMensagem({
        texto: error.response?.data?.message || 'Erro ao salvar disponibilidade',
        tipo: 'erro'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <MdEventAvailable className="text-blue-600" />
            Definir Horários de Atendimento
          </h2>
          <p className="text-gray-600 mt-1">Cadastre os horários disponíveis para consultas médicas</p>
        </div>

        {/* Formulário */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="space-y-5">
            {/* Campo Médico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Médico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserMd className="text-gray-400" />
                </div>
                {carregandoMedicos ? (
                  <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                ) : (
                  <select
                    name="medicoId"
                    value={form.medicoId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Selecione um médico</option>
                    {medicos.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Campo Especialidade */}
            {form.medicoId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaStethoscope className="text-gray-400" />
                  </div>
                  <select
                    name="especialidadeId"
                    value={form.especialidadeId}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Selecione uma especialidade</option>
                    {especialidadesFiltradas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Campos em Linha */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Dia da Semana */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dia da Semana</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCalendarDay className="text-gray-400" />
                  </div>
                  <select
                    name="diaSemana"
                    value={form.diaSemana}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Selecione um dia</option>
                    {diasSemana.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horário Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Início</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdAccessTime className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="horaInicio"
                    value={form.horaInicio}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Horário Término */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Término</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdAccessTime className="text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="horaFim"
                    value={form.horaFim}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Duração da Consulta */}
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração da Consulta (minutos)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaClock className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="duracaoConsultaMinutos"
                  value={form.duracaoConsultaMinutos}
                  onChange={handleChange}
                  min="5"
                  max="180"
                  step="5"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Duração entre 5 e 180 minutos</p>
            </div>

            {/* Mensagem de Feedback */}
            {mensagem.texto && (
              <div className={`p-3 rounded-lg border ${mensagem.tipo === 'erro'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'}`}>
                <div className="flex items-center">
                  {mensagem.tipo === 'erro' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{mensagem.texto}</span>
                </div>
              </div>
            )}

            {/* Botão de Salvar */}
            <div className="pt-2">
              <button
                onClick={salvarDisponibilidade}
                disabled={loading}
                className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } transition-all shadow-sm hover:shadow-md`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <FaSave /> Salvar Disponibilidade
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Disponibilidades */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaClock className="text-blue-500" />
              Disponibilidades Cadastradas
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {disponibilidades.length} registros
            </span>
          </div>

          {disponibilidades.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="mt-2 text-sm font-medium text-gray-700">Nenhuma disponibilidade cadastrada</h4>
              <p className="mt-1 text-sm text-gray-500">Cadastre os horários disponíveis para consultas</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Médico
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Especialidade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dia
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horário
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duração
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {disponibilidades.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {d.medico}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {d.especialidade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {diasSemana[d.diaSemana]?.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {d.horaInicio} - {d.horaFim}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {d.duracaoConsultaMinutos} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <FaEdit />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default DisponibilidadesPage;
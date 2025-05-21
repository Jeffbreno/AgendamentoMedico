import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { 
  FaSearch, 
  FaStethoscope, 
  FaFilter, 
  FaCalendarAlt,
  FaUserAlt,
  FaUserMd,
  FaNotesMedical,
  FaSpinner
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

function AtendimentosPage() {
  const [atendimentos, setAtendimentos] = useState([]);
  const [filtro, setFiltro] = useState({
    dataInicio: '',
    dataFim: '',
    paciente: '',
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const carregarAtendimentos = async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (filtro.dataInicio) params.append('dataInicio', filtro.dataInicio);
      if (filtro.dataFim) params.append('dataFim', filtro.dataFim);
      if (filtro.paciente) params.append('paciente', filtro.paciente);

      const res = await api.get(`/atendimentos?${params.toString()}`);
      setAtendimentos(res.data);
      setErro('');
    } catch (error) {
      setErro(error.response?.data?.message || 'Erro ao buscar atendimentos.');
      setAtendimentos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarAtendimentos();
  }, []);

  const atualizarFiltro = (e) => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
    if (erro) setErro('');
  };

  const formatarData = (data) => {
    return format(parseISO(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const limparFiltros = () => {
    setFiltro({
      dataInicio: '',
      dataFim: '',
      paciente: '',
    });
    carregarAtendimentos();
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaStethoscope className="text-green-600" />
            Atendimentos Médicos
          </h2>
          
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-4 md:mt-0"
          >
            <FaFilter />
            {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              Filtros
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  Data Início
                </label>
                <input
                  type="date"
                  name="dataInicio"
                  value={filtro.dataInicio}
                  onChange={atualizarFiltro}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-400" />
                  Data Fim
                </label>
                <input
                  type="date"
                  name="dataFim"
                  value={filtro.dataFim}
                  onChange={atualizarFiltro}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaUserAlt className="text-gray-400" />
                  Paciente
                </label>
                <input
                  type="text"
                  name="paciente"
                  placeholder="Nome do paciente"
                  value={filtro.paciente}
                  onChange={atualizarFiltro}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={carregarAtendimentos}
                  disabled={carregando}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {carregando ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaSearch />
                  )}
                  Buscar
                </button>
                
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{erro}</p>
            </div>
          </div>
        )}

        {/* Resultados */}
        {carregando && atendimentos.length === 0 ? (
          <div className="flex justify-center py-10">
            <FaSpinner className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : atendimentos.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h4 className="mt-2 text-lg font-medium text-gray-700">Nenhum atendimento encontrado</h4>
            <p className="mt-1 text-gray-500">Tente ajustar os filtros ou cadastre novos atendimentos</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUserAlt className="text-gray-400" />
                        Paciente
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        Data/Hora
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaUserMd className="text-gray-400" />
                        Médico
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaStethoscope className="text-gray-400" />
                        Especialidade
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Convênio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FaNotesMedical className="text-gray-400" />
                        Observações
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {atendimentos.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{a.paciente}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatarData(a.dataAtendimento)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{a.medico}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{a.especialidade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{a.convenio}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {a.observacoes || (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Rodapé da tabela */}
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{atendimentos.length}</span> atendimentos
              </div>
              {/* Aqui você pode adicionar paginação se necessário */}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AtendimentosPage;
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { FaCalendarAlt, FaUserMd, FaClock, FaSearch, FaArrowRight, FaCalendarDay, FaCalendarWeek } from 'react-icons/fa';
import { MdEventAvailable, MdEventBusy } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';

function AgendamentoPage() {
    const [especialidades, setEspecialidades] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [filtro, setFiltro] = useState({
        especialidadeId: '',
        dataInicio: '',
        dataFim: '',
        medico: '',
    });
    const [horarios, setHorarios] = useState([]);
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [modoBusca, setModoBusca] = useState('dia'); // 'dia' ou 'periodo'
    const navigate = useNavigate();

    useEffect(() => {
        const carregarDados = async () => {
            setLoading(true);
            try {
                const [resEspecialidades, resMedicos] = await Promise.all([
                    api.get('/especialidades'),
                    api.get('/medicos')
                ]);
                setEspecialidades(resEspecialidades.data);
                setMedicos(resMedicos.data);
            } catch (error) {
                setErro('Erro ao carregar dados iniciais');
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    const atualizarFiltro = (e) => {
        setFiltro({ ...filtro, [e.target.name]: e.target.value });
        if (erro) setErro('');
    };

    const buscarHorarios = async () => {
        if (!filtro.especialidadeId) {
            setErro('Por favor, selecione uma especialidade');
            return;
        }

        if (modoBusca === 'dia' && !filtro.dataInicio) {
            setErro('Por favor, selecione uma data');
            return;
        }

        if (modoBusca === 'periodo' && (!filtro.dataInicio || !filtro.dataFim)) {
            setErro('Por favor, selecione um período');
            return;
        }

        setLoading(true);
        try {
            const params = {
                especialidadeId: filtro.especialidadeId,
                medico: filtro.medico,
                dataInicio: filtro.dataInicio,
                dataFim: modoBusca === 'periodo' ? filtro.dataFim : filtro.dataInicio
            };

            const res = await api.post('/disponibilidades', params);
            setHorarios(res.data);
        } catch {
            setErro('Erro ao buscar horários disponíveis');
        } finally {
            setLoading(false);
        }
    };

    // Agrupa horários por data para exibição organizada
    const horariosAgrupados = horarios.reduce((acc, horario) => {
        const data = horario.data;
        if (!acc[data]) {
            acc[data] = [];
        }
        acc[data].push(horario);
        return acc;
    }, {});

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-600" />
                    Agendar Consulta
                </h2>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setModoBusca('dia')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                modoBusca === 'dia' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <FaCalendarDay /> Por dia
                        </button>
                        <button
                            onClick={() => setModoBusca('periodo')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                modoBusca === 'periodo' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            <FaCalendarWeek /> Por período
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidade</label>
                            <div className="relative">
                                <FaUserMd className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    name="especialidadeId"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                                        erro && !filtro.especialidadeId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    value={filtro.especialidadeId}
                                    onChange={atualizarFiltro}
                                >
                                    <option value="">Selecione a especialidade</option>
                                    {especialidades.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {modoBusca === 'dia' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                    <DatePicker
                                        selected={filtro.dataInicio ? new Date(filtro.dataInicio) : null}
                                        onChange={(date) => setFiltro({...filtro, dataInicio: date.toISOString().split('T')[0]})}
                                        dateFormat="dd/MM/yyyy"
                                        locale={ptBR}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholderText="Selecione uma data"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                        <DatePicker
                                            selected={filtro.dataInicio ? new Date(filtro.dataInicio) : null}
                                            onChange={(date) => setFiltro({...filtro, dataInicio: date.toISOString().split('T')[0]})}
                                            dateFormat="dd/MM/yyyy"
                                            locale={ptBR}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholderText="Data inicial"
                                            selectsStart
                                            startDate={filtro.dataInicio ? new Date(filtro.dataInicio) : null}
                                            endDate={filtro.dataFim ? new Date(filtro.dataFim) : null}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                                    <div className="relative">
                                        <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                        <DatePicker
                                            selected={filtro.dataFim ? new Date(filtro.dataFim) : null}
                                            onChange={(date) => setFiltro({...filtro, dataFim: date.toISOString().split('T')[0]})}
                                            dateFormat="dd/MM/yyyy"
                                            locale={ptBR}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholderText="Data final"
                                            selectsEnd
                                            startDate={filtro.dataInicio ? new Date(filtro.dataInicio) : null}
                                            endDate={filtro.dataFim ? new Date(filtro.dataFim) : null}
                                            minDate={filtro.dataInicio ? new Date(filtro.dataInicio) : null}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Médico (opcional)</label>
                            <div className="relative">
                                <FaUserMd className="absolute left-3 top-3 text-gray-400" />
                                <select
                                    name="medico"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={filtro.medico}
                                    onChange={atualizarFiltro}
                                >
                                    <option value="">Qualquer médico</option>
                                    {medicos.map((m) => (
                                        <option key={m.id} value={m.nome}>
                                            {m.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={buscarHorarios}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 w-full md:w-auto"
                    >
                        {loading ? (
                            <span className="animate-spin">↻</span>
                        ) : (
                            <>
                                <FaSearch /> Buscar horários
                            </>
                        )}
                    </button>

                    {erro && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {erro}
                        </div>
                    )}
                </div>

                {loading && Object.keys(horariosAgrupados).length === 0 ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : Object.keys(horariosAgrupados).length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
                        {filtro.especialidadeId && (filtro.dataInicio || (modoBusca === 'periodo' && filtro.dataFim))
                            ? "Nenhum horário disponível para os critérios selecionados"
                            : "Preencha os campos acima para buscar horários disponíveis"}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {Object.entries(horariosAgrupados).map(([data, horariosDia]) => (
                            <div key={data} className="mb-6 last:mb-0">
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <FaCalendarAlt className="text-blue-600" />
                                        {new Date(data).toLocaleDateString('pt-BR', { 
                                            weekday: 'long', 
                                            day: '2-digit', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        })}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {especialidades.find(e => e.id == filtro.especialidadeId)?.nome}
                                        {filtro.medico && ` • Dr(a). ${filtro.medico}`}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    {horariosDia.map((h, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-lg border transition-all ${
                                                h.disponivel 
                                                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                                    : 'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {h.disponivel ? (
                                                        <MdEventAvailable className="text-green-500 text-xl" />
                                                    ) : (
                                                        <MdEventBusy className="text-gray-400 text-xl" />
                                                    )}
                                                    <span className="font-semibold">
                                                        {h.horaInicio} - {h.horaFim}
                                                    </span>
                                                </div>
                                                {h.disponivel ? (
                                                    <button
                                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                                                        onClick={() =>
                                                            navigate('/agendamento/novo', {
                                                                state: {
                                                                    horario: {
                                                                        ...h,
                                                                        data: data,
                                                                        especialidadeId: filtro.especialidadeId,
                                                                        especialidadeNome: especialidades.find(e => e.id == filtro.especialidadeId)?.nome,
                                                                    },
                                                                },
                                                            })
                                                        }
                                                    >
                                                        Agendar <FaArrowRight className="text-sm" />
                                                    </button>
                                                ) : (
                                                    <div className="text-sm text-gray-600">
                                                        {h.paciente ? `Agendado para ${h.paciente}` : 'Indisponível'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default AgendamentoPage;
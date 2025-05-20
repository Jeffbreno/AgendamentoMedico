import { useEffect, useState } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

function AgendamentoPage() {
    const navigate = useNavigate();
    const [especialidades, setEspecialidades] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [filtro, setFiltro] = useState({
        especialidadeId: '',
        data: '',
        medico: '',
    });
    const [horarios, setHorarios] = useState([]);
    const [erro, setErro] = useState('');

    useEffect(() => {
        api.get('/especialidades').then((res) => setEspecialidades(res.data));
        api.get('/medicos').then((res) => setMedicos(res.data));
    }, []);

    const atualizarFiltro = (e) => {
        setFiltro({ ...filtro, [e.target.name]: e.target.value });
        if (erro) setErro('');
    };

    const buscarHorarios = async () => {
        if (!filtro.especialidadeId || !filtro.data) {
            setErro('Especialidade e data são obrigatórios.');
            return;
        }

        try {
            const res = await api.post('/disponibilidades', filtro);
            setHorarios(res.data);
        } catch {
            setErro('Erro ao buscar horários.');
        }
    };

    return (
        <Layout>
            <h2 className="text-2xl font-bold mb-4">Agendar Consulta</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                    name="especialidadeId"
                    className="border px-4 py-2 rounded"
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

                <input
                    type="date"
                    name="data"
                    className="border px-4 py-2 rounded"
                    value={filtro.data}
                    onChange={atualizarFiltro}
                />

                <select
                    name="medico"
                    className="border px-4 py-2 rounded"
                    value={filtro.medico}
                    onChange={atualizarFiltro}
                >
                    <option value="">(Opcional) Médico específico</option>
                    {medicos.map((m) => (
                        <option key={m.id} value={m.nome}>
                            {m.nome}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={buscarHorarios}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            >
                Buscar horários
            </button>

            {erro && <div className="text-red-500 text-sm mb-4">{erro}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {horarios.map((h, idx) => (
                    <div
                        key={idx}
                        className={`p-4 rounded shadow border ${h.disponivel ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
                            }`}
                    >
                        <div className="font-semibold">
                            {h.horaInicio} - {h.horaFim}
                        </div>
                        {h.disponivel ? (
                            <button
                                className="mt-2 text-blue-600 hover:underline"
                                onClick={() =>
                                    navigate('/agendamento/novo', {
                                        state: {
                                            horario: {
                                                ...h,
                                                data: filtro.data,
                                                especialidadeId: filtro.especialidadeId,
                                                especialidadeNome: especialidades.find(e => e.id == filtro.especialidadeId)?.nome,
                                            },
                                        },
                                    })
                                }
                            >
                                Agendar
                            </button>
                        ) : (
                            <div className="text-sm text-gray-700 mt-1">
                                Indisponível — Paciente: <strong>{h.paciente || 'Ocupado'}</strong>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default AgendamentoPage;

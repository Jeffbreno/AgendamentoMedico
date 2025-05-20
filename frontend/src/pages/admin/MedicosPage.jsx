import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';

function MedicosPage() {
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [form, setForm] = useState({ nome: '', especialidadeIds: [] });
  const [erro, setErro] = useState('');
  const [idEditando, setIdEditando] = useState(null);
  const [modal, setModal] = useState({ show: false, id: null });

  const carregar = async () => {
    const [resMedicos, resEspecialidades] = await Promise.all([
      api.get('/medicos'),
      api.get('/especialidades')
    ]);
    setMedicos(resMedicos.data);
    setEspecialidades(resEspecialidades.data);
    setForm({ nome: '', especialidadeIds: [] });
    setIdEditando(null);
  };

  useEffect(() => {
    carregar();
  }, []);

  const atualizarForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (erro) setErro('');
  };

  const toggleEspecialidade = (id) => {
    setForm((prev) => ({
      ...prev,
      especialidadeIds: prev.especialidadeIds.includes(id)
        ? prev.especialidadeIds.filter((i) => i !== id)
        : [...prev.especialidadeIds, id],
    }));
  };

  const salvar = async () => {
    if (!form.nome.trim() || form.especialidadeIds.length === 0) {
      setErro('Nome e especialidades são obrigatórios.');
      return;
    }

    try {
      if (idEditando) {
        await api.patch(`/medicos/${idEditando}`, form);
      } else {
        await api.post('/medicos', form);
      }
      await carregar();
    } catch {
      setErro('Erro ao salvar médico.');
    }
  };

  const editar = (m) => {
    setIdEditando(m.id);
    setForm({
      nome: m.nome,
      especialidadeIds: m.especialidades.map((e) => e.id),
    });
    setErro('');
  };

  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  const excluir = async () => {
    try {
      await api.delete(`/medicos/${modal.id}`);
      cancelarExclusao();
      carregar();
    } catch {
      alert('Erro ao excluir.');
    }
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Gerenciar Médicos</h2>

      <div className="space-y-2 mb-4">
        <input
          name="nome"
          className={`border px-4 py-2 rounded w-full ${
            erro ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nome do médico"
          value={form.nome}
          onChange={atualizarForm}
        />

        <div className="flex flex-wrap gap-2">
          {especialidades.map((esp) => (
            <label key={esp.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={form.especialidadeIds.includes(esp.id)}
                onChange={() => toggleEspecialidade(esp.id)}
              />
              {esp.nome}
            </label>
          ))}
        </div>

        <button
          onClick={salvar}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {idEditando ? 'Salvar' : 'Adicionar'}
        </button>

        {erro && <div className="text-red-500 text-sm">{erro}</div>}
      </div>

      <ul className="space-y-2">
        {medicos.map((m) => (
          <li
            key={m.id}
            className="flex justify-between items-start bg-white p-3 border rounded shadow-sm"
          >
            <div>
              <div className="font-semibold">{m.nome}</div>
              <div className="text-sm text-gray-600">
                Especialidades: {m.especialidades.map((e) => e.nome).join(', ')}
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => editar(m)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => confirmarExclusao(m.id)}
                className="text-red-500 hover:underline"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmModal
        show={modal.show}
        onClose={cancelarExclusao}
        onConfirm={excluir}
        message="Deseja realmente excluir este médico?"
      />
    </Layout>
  );
}

export default MedicosPage;

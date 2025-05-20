import { useEffect, useState } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';

function ConveniosPage() {
  const [convenios, setConvenios] = useState([]);
  const [nome, setNome] = useState('');
  const [idEditando, setIdEditando] = useState(null);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState({ show: false, id: null });

  const carregar = async () => {
    const res = await api.get('/convenios');
    setConvenios(res.data);
    setNome('');
    setIdEditando(null);
  };

  const salvar = async () => {
    if (!nome.trim()) {
      setErro('O nome é obrigatório.');
      return;
    }

    try {
      if (idEditando) {
        await api.patch(`/convenios/${idEditando}`, { nome });
      } else {
        await api.post('/convenios', { nome });
      }
      await carregar();
    } catch {
      setErro('Erro ao salvar convênio.');
    }
  };

  const editar = (item) => {
    setNome(item.nome);
    setIdEditando(item.id);
    setErro('');
  };

  const confirmarExclusao = (id) => setModal({ show: true, id });
  const cancelarExclusao = () => setModal({ show: false, id: null });

  const excluir = async () => {
    try {
      await api.delete(`/convenios/${modal.id}`);
      cancelarExclusao();
      carregar();
    } catch {
      alert('Erro ao excluir.');
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-4">Gerenciar Convênios</h2>

      <div className="flex gap-2 mb-2">
        <input
          className={`border px-4 py-2 rounded w-full ${
            erro ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nome do convênio"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            if (erro) setErro('');
          }}
        />
        <button
          onClick={salvar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {idEditando ? 'Salvar' : 'Adicionar'}
        </button>
      </div>
      {erro && <div className="text-red-500 text-sm mb-4">{erro}</div>}

      <ul className="space-y-2">
        {convenios.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-center bg-white p-3 border rounded shadow-sm"
          >
            <span>{item.nome}</span>
            <div className="flex gap-2">
              <button
                onClick={() => editar(item)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => confirmarExclusao(item.id)}
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
        message="Deseja realmente excluir este convênio?"
      />
    </Layout>
  );
}

export default ConveniosPage;

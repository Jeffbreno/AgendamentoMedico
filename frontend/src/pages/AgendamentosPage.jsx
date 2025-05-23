import { useEffect, useState } from "react";
import {
  getAgendamentos,
  atualizarStatusAgendamento,
} from "../api/agendamentos";
import { getPacientes } from "../api/pacientes";
import Loading from "../components/Loading";
import Table from "../components/Table";

import { FaListAlt, FaSearch } from "react-icons/fa";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

function AgendamentosPage() {
  const [pacientes, setPacientes] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modal, setModal] = useState({ show: false, id: null, novoStatus: "" });

  const [filtros, setFiltros] = useState({
    paciente: "",
    dataInicio: "",
    dataFim: "",
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const carregarPacientes = async () => {
    try {
      const data = await getPacientes();
      setPacientes(data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar pacientes");
    }
  };

  const buscarAgendamentos = async () => {
    setLoading(true);
    setErro("");
    try {
      const data = await getAgendamentos(filtros);
      setAgendamentos(data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPacientes();
  }, []);

  const confirmarMudancaStatus = (id, novoStatus) => {
    setModal({ show: true, id, novoStatus });
  };

  const cancelarMudancaStatus = () => {
    setModal({ show: false, id: null, novoStatus: "" });
  };

  const atualizarStatus = async () => {
    setLoading(true);
    try {
      await atualizarStatusAgendamento(modal.id, modal.novoStatus);
      await buscarAgendamentos();
      cancelarMudancaStatus();
    } catch (err) {
      console.error(err);
      setErro("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Agendado":
        return "text-blue-600";
      case "Confirmado":
        return "text-green-600";
      case "Realizado":
        return "text-emerald-600";
      case "Cancelado":
        return "text-red-600";
      case "Falta":
        return "text-orange-500";
      default:
        return "text-gray-600";
    }
  };

  const agendamentosPaginados = agendamentos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(agendamentos.length / itemsPerPage);

  const columns = [
    { header: "Paciente", accessor: "paciente" },
    { header: "Especialidade", accessor: "especialidade" },
    { header: "Convênio", accessor: "convenio" },
    { header: "Médico", accessor: "medico" },
    {
      header: "Data/Hora",
      accessor: "dataHora",
      render: (v) => new Date(v).toLocaleString("pt-BR"),
    },
    {
      header: "Status",
      accessor: "status",
      render: (status) => (
        <span className={`text-sm font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      ),
    },
    {
      header: "Alterar Status",
      accessor: "id",
      render: (id, row) => (
        <select
          value={row.status}
          onChange={(e) => confirmarMudancaStatus(id, e.target.value)}
          className="border text-sm rounded px-2 py-1"
        >
          {["Agendado", "Confirmado", "Cancelado", "Realizado", "Falta"].map(
            (opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            )
          )}
        </select>
      ),
    },
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
            <option key={p.id} value={p.nome}>
              {p.nome}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filtros.dataInicio}
          onChange={(e) =>
            setFiltros({ ...filtros, dataInicio: e.target.value })
          }
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
        <>
          <div className="bg-white p-4 rounded shadow">
            <Table
              data={agendamentosPaginados}
              columns={columns}
              emptyMessage="Nenhum agendamento encontrado"
            />
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <ConfirmModal
            show={modal.show}
            onClose={cancelarMudancaStatus}
            onConfirm={atualizarStatus}
            title="Alterar Status"
            message={`Deseja realmente alterar o status para "${modal.novoStatus}"?`}
            confirmText="Alterar"
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

export default AgendamentosPage;

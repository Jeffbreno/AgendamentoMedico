import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import withLayout from './hocs/withLayout';

import EspecialidadesPage from './pages/EspecialidadesPage';
import ConveniosPage from './pages/ConveniosPage';
import MedicosPage from './pages/MedicosPage';
import PacientesPage from './pages/PacientesPage';

import AgendamentoPage from './pages/AgendamentoPage';
import AgendamentosPage from './pages/AgendamentosPage';
import DisponibilidadesPage from './pages/DisponibilidadePage';
import AtendimentosPage from './pages/AtendimentosPage';

const AgendamentoWithLayout = withLayout(AgendamentoPage, 'Agendamento');
const AgendamentosWithLayout = withLayout(AgendamentosPage, 'Agendamentos');
const DisponibilidadesWithLayout = withLayout(DisponibilidadesPage, 'Disponibilidades');
const AtendimentosWithLayout = withLayout(AtendimentosPage, 'Atendimentos');
const EspecialidadesWithLayout = withLayout(EspecialidadesPage, 'Especialidades');
const ConveniosWithLayout = withLayout(ConveniosPage, 'Convênios');
const MedicosWithLayout = withLayout(MedicosPage, 'Médicos');
const PacientesWithLayout = withLayout(PacientesPage, 'Pacientes');


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Consultas */}
        <Route path="/agendamento/novo" element={< AgendamentoWithLayout/>} />
        <Route path="/agendamentos" element={< AgendamentosWithLayout/>} />
        {/* <Route path="/agendamentos/novo" element={<NovoAgendamentoWithLayout />} /> */}
        <Route path="/disponibilidades" element={<DisponibilidadesWithLayout />} />
        
        {/* Atendimentos */}
        <Route path="/atendimentos" element={<AtendimentosWithLayout />} />
        {/* <Route path="/atendimentos/novo" element={<NovoAtendimentoWithLayout />} /> */}
        
        {/* Cadastros */}
        <Route path="*" element={<EspecialidadesWithLayout />} />
        <Route path="/convenios" element={<ConveniosWithLayout />} />
        <Route path="/medicos" element={<MedicosWithLayout />} />
        <Route path="/pacientes" element={<PacientesWithLayout />} />
        
        {/* Fallback */}
        {/* <Route path="*" element={<DashboardWithLayout />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
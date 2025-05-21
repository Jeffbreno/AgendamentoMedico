import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import EspecialidadesPage from './pages/admin/EspecialidadesPage';
import ConveniosPage from './pages/admin/ConveniosPage';
import MedicosPage from './pages/admin/MedicosPage';
import PacientesPage from './pages/admin/PacientesPage';
import AgendamentoPage from './pages/AgendamentoPage';
import AgendamentoNovoPage from './pages/AgendamentoNovoPage';
import DisponibilidadesPage from './pages/admin/DisponibilidadesPage';
import AtendimentosPage from './pages/AtendimentosPage';
import AtendimentoNovoPage from './pages/AtendimentoNovoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/especialidades" element={<EspecialidadesPage />} />
        <Route path="/admin/convenios" element={<ConveniosPage />} />
        <Route path="/admin/medicos" element={<MedicosPage />} />
        <Route path="/admin/pacientes" element={<PacientesPage />} />
        <Route path="*" element={<EspecialidadesPage />} />
        <Route path="/agendamento" element={<AgendamentoPage />} />
        <Route path="/agendamento/novo" element={<AgendamentoNovoPage />} />
        <Route path="/admin/disponibilidades" element={<DisponibilidadesPage />} />
        <Route path="/atendimentos" element={<AtendimentosPage />} />
        <Route path="/atendimentos/novo" element={<AtendimentoNovoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

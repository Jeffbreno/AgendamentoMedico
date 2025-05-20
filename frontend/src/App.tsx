import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import EspecialidadesPage from './pages/Admin/EspecialidadesPage';
import ConveniosPage from './pages/Admin/ConveniosPage';
import MedicosPage from './pages/Admin/MedicosPage';
import PacientesPage from './pages/Admin/PacientesPage';
import AgendamentoPage from './pages/AgendamentoPage';
import AgendamentoNovoPage from './pages/AgendamentoNovoPage';

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
      </Routes>
    </BrowserRouter>
  )
}

export default App

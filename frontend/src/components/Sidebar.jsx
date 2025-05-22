import { Link, useLocation } from 'react-router-dom';
import {
  FaUserMd,
  FaHospital,
  FaStethoscope,
  FaCalendarPlus,
  FaClipboardList,
  FaClock,
  FaChevronDown,
  FaChevronRight,
  FaNotesMedical,
  FaHistory,
  FaUserInjured,
} from 'react-icons/fa';
import { useState } from 'react';

const navItems = [
  {
    section: 'Consultas',
    items: [
      { label: 'Agendar Consulta', to: '/agendamento/novo', icon: <FaCalendarPlus /> },
      { label: 'Agendamentos', to: '/agendamentos', icon: <FaClipboardList /> },
    ],
  },
  {
    section: 'Atendimentos',
    items: [
      { label: 'Histórico de Atendimentos', to: '/atendimentos', icon: <FaHistory /> },
    ],
  },
  {
    section: 'Cadastros',
    items: [
      { label: 'Disponibilidades', to: '/disponibilidades', icon: <FaClock /> },
      { label: 'Pacientes', to: '/pacientes', icon: <FaUserInjured /> },
      { label: 'Médicos', to: '/medicos', icon: <FaUserMd /> },
      { label: 'Especialidades', to: '/especialidades', icon: <FaStethoscope /> },
      { label: 'Convênios', to: '/convenios', icon: <FaHospital /> },
    ],
  },
];

function Sidebar() {
  const { pathname } = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    'Consultas': true,
    'Atendimentos': true,
    'Cadastros': true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200/50 min-h-screen flex flex-col shadow-sm">
      {/* Logo/Cabeçalho */}
      <div className="p-5 border-b border-gray-200/75">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
          </svg>
          Clínica Médica
        </h2>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        {navItems.map((group, idx) => (
          <div key={idx} className="mb-6">
            <button 
              onClick={() => toggleSection(group.section)}
              className="flex items-center justify-between w-full text-[11px] text-gray-500 tracking-wide uppercase mb-2 px-2 py-1.5 rounded hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="font-medium">{group.section}</span>
              {expandedSections[group.section] ? (
                <FaChevronDown className="text-xs text-gray-500" />
              ) : (
                <FaChevronRight className="text-xs text-gray-500" />
              )}
            </button>
            
            {expandedSections[group.section] && (
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.to || 
                                   (item.to !== '/' && pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-50 text-blue-700 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-base ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div className="p-4 border-t border-gray-200/75 text-xs text-gray-500">
        <p>v1.0.0</p>
        <p className="text-gray-400 mt-1">© {new Date().getFullYear()} Clínica</p>
      </div>
    </aside>
  );
}

export default Sidebar;
